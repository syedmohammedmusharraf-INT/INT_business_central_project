from datetime import datetime, timezone
from bson import ObjectId
from collections import defaultdict
import traceback
import os
from dotenv import load_dotenv
import asyncio

from app.core.database import get_db
from app.utils.linkedin_extractor import async_run_extract_linkedin_profile
from app.services.lead_validator import validate_lead_profile


# -----------------------------
# MONGO FETCH
# -----------------------------
async def get_lead(lead_id):
    db = get_db()
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})

    if not lead:
        raise ValueError("Lead not found in MongoDB")

    return lead

# ----------------------------------------------------------------------------------
#  LINKEDIN VALIDATION
# ----------------------------------------------------------------------------------
async def validate_lead_linkedin_profile(lead_id: str):
    """
    Independently handles LinkedIn extraction, validation, and final scoring.
    """
    db = get_db()
    lead = None
    try:
        print(f"\n==== LINKEDIN VALIDATION START: {lead_id} ====")
        lead = await get_lead(lead_id)
        summary = lead.get("extraction_summary")  # the summarize version of the given requiremnt file
        
        if not summary:
            print("No extraction summary found. Validation skipped.")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "skipped"}})
            return {"status": "skipped", "reason": "No extraction summary"}

        primary_contact = next((c for c in lead.get("contacts", []) if c.get("is_primary")), None)
        linkedin_url = primary_contact.get("linkedin") if primary_contact else None

        if not linkedin_url:
            print("No LinkedIn URL found for primary contact.")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "skipped"}})
            return {"status": "skipped", "reason": "No LinkedIn URL"}

        # Mark as processing
        await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "processing"}})

        
        # 1. Extraction (with timeout)
        linkedin_data_model = None
        try:
            linkedin_data_model = await asyncio.wait_for(
                async_run_extract_linkedin_profile(linkedin_url),
                timeout= 420.0 # Increased timeout for robustness
            )
        except asyncio.TimeoutError:
            print("LinkedIn extraction timed out independently.")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "failed", "last_error": "Timeout"}})
            return {"status": "failed", "reason": "Extraction timed out"}
        except Exception as e:
            print(f"LinkedIn extraction failed: {e}")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "failed", "last_error": str(e)}})
            return {"status": "failed", "reason": str(e)}

        if not linkedin_data_model:
            print("Agent returned empty result.")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "failed", "last_error": "Empty extraction"}})
            return {"status": "failed", "reason": "No data extracted from profile"}

        # 2. Validation function calling by passing lead context and req context
        validation_result = None
        profile_score = 0.0
        try:
            linkedin_data = linkedin_data_model.model_dump()
            company = await db.companies.find_one({"_id": lead["company_id"]})
            company_name = company["name"] if company else "Unknown"
            
            val_context= {
                "company_name": company_name,
                "industry": lead.get("industry") ,
                "requirements": lead.get("painPoints")
            }
            
            # function calling portion -------------------------------------------->
            validation_result = await validate_lead_profile(linkedin_data, val_context)
            profile_score = float(validation_result.total_profile_score)

        except Exception as ve:
            print(f"Validation step failed: {ve}")
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "failed", "last_error": f"Validation Error: {str(ve)}"}})
            return {"status": "failed", "reason": "Scoring/Validation failed"}

        # 3. Final Scoring & Decision (Fallback included)
        alignment_score = lead.get("score", 0.0)
        
        # If we have a valid profile score, blend it. Otherwise fall back to alignment only.
        if profile_score > 0:
            final_score = (alignment_score * 0.5) + (profile_score * 0.5)
        else:
            final_score = alignment_score
            
        qualification_decision = "Proceed" if final_score >= 70 else "Hold"

        # 4. Update Lead Record
        update_data = {
            "profile_score": profile_score,
            "final_score": final_score,
            "qualification_decision": qualification_decision,
            "profile_validation": validation_result.model_dump() if validation_result else None,
            "validation_status": "completed",
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update_data})
        
        return {**update_data, "status": "completed"}

    except Exception as e:
        traceback.print_exc()
        if lead:
            await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"validation_status": "failed", "last_error": str(e)}})
        return {"status": "failed", "reason": str(e)}
