from fastapi import APIRouter, HTTPException, Body
from app.services.lead_intelligence import generate_service_alignment
from app.services.pitch_generator import generate_pitch_content
from app.services.lead_linkedin_entry import validate_lead_linkedin_profile
from app.models.pitch_schema import PitchCreate, PitchDB
from app.core.database import get_db
from bson import ObjectId
from datetime import datetime, timezone
from typing import List
import asyncio
from fastapi import Path


router = APIRouter()

# ------------------- PERFORMING SERVICE ALIGNMENT HERE ---------------------------------
@router.get("/intelligence/service-alignment/{lead_id}")
async def get_service_alignment(lead_id: str):
    try:
        return await generate_service_alignment(lead_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- LINKEDIN VALIDATION HERE -----------------------------------------
@router.get(
    "/intelligence/validate-profile/{lead_id}",
    summary="Validate LinkedIn profile against lead requirements",
    description="""
    Extracts LinkedIn profile data for the primary contact of the lead,
    evaluates decision-making authority, relevance to company requirements,
    and produces a qualification score.
    """
)
async def validate_profile(lead_id: str = Path(...,description="Unique identifier of the lead to be validated")):
    try:
        result = await validate_lead_linkedin_profile(lead_id)
        if not result:
            return {"status": "skipped", "message": "No LinkedIn URL or extraction failed"}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------- PITCH GENERATION PORTION-------------------
@router.post("/intelligence/generate-pitch")
async def generate_pitch(payload: PitchCreate):
    db = get_db()
    try:
        # 1. Fetch lead details
        lead = await db.leads.find_one({"_id": ObjectId(payload.lead_id)})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # 2. Get company details for the pitch
        company = await db.companies.find_one({"_id": lead["company_id"]})
        company_name = company["name"] if company else lead.get("company_name", "Unknown")
        company_size = company["size"] if company else "N/A"
        
        # 3. Aggregate full context for dynamic prompt
        extraction = lead.get("extraction_summary", {})
        biz_context = lead.get("business_context", {})
        
        lead_context = {
            "company_name": company_name,
            "company_size": company_size,
            "industry": lead.get("industry") or biz_context.get("industry", "Unknown"),
            "pain_points": extraction.get("problems") or biz_context.get("pain_points_requirements_text", "No specific pain points reported"),
            "business_identity": extraction.get("identity", "N/A"),
            "business_intent": extraction.get("intent", "N/A"),
            "tech_stack": extraction.get("technologies", "N/A"),
            "budget": biz_context.get("estimated_budget", "Not specified"),
            "timeline": biz_context.get("timeline", "Flexible")
        }
        
        content = await generate_pitch_content(
            lead_context, 
            payload.selected_services, 
            payload.config
        )
        
        # 4. Save pitch to database
        pitch_doc = {
            "lead_id": payload.lead_id,
            "company_name": company_name,
            "industry": lead_context["industry"],
            "content": content,
            "config": payload.config.dict(),
            "services": payload.selected_services,
            "generated_by": "Sarah Johnson",
            "version": 1,
            "status": "Active",
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db.pitches.insert_one(pitch_doc)
        
        return {
            "id": str(result.inserted_id),
            "content": content,
            "message": "Pitch generated and saved successfully"
        }
    except Exception as e:
        print(f"Error generating pitch: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/pitches")
async def get_pitches():
    db = get_db()
    try:
        cursor = db.pitches.find().sort("created_at", -1)
        pitches = await cursor.to_list(length=100)
        
        return [
            {
                "id": str(p["_id"]),
                "leadId": p["lead_id"],
                "companyName": p["company_name"],
                "industry": p["industry"],
                "version": p.get("version", 1),
                "generatedDate": p["created_at"].isoformat(),
                "generatedBy": p.get("generated_by", "Sarah Johnson"),
                "targetAudience": p["config"].get("audience", "C-Level Executives"),
                "tone": p["config"].get("tone", "Professional"),
                "length": p["config"].get("length", "Detailed"),
                "focusAreas": p["config"].get("focusAreas", []),
                "services": p.get("services", []),
                "status": p.get("status", "Active"),
                "content": p.get("content", ""),
                "excerpt": p["content"][:200] + "..." if len(p["content"]) > 200 else p["content"]
            }
            for p in pitches
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/intelligence/pitches/{pitch_id}")
async def get_pitch(pitch_id: str):
    db = get_db()
    try:
        p = await db.pitches.find_one({"_id": ObjectId(pitch_id)})
        if not p:
            raise HTTPException(status_code=404, detail="Pitch not found")
            
        return {
            "id": str(p["_id"]),
            "leadId": p["lead_id"],
            "companyName": p["company_name"],
            "industry": p["industry"],
            "version": p.get("version", 1),
            "generatedDate": p["created_at"].isoformat(),
            "generatedBy": p.get("generated_by", "Sarah Johnson"),
            "targetAudience": p["config"].get("audience", "C-Level Executives"),
            "tone": p["config"].get("tone", "Professional"),
            "length": p["config"].get("length", "Detailed"),
            "focusAreas": p["config"].get("focusAreas", []),
            "services": p.get("services", []),
            "status": p.get("status", "Active"),
            "content": p.get("content", ""),
            "excerpt": p["content"][:200] + "..." if len(p["content"]) > 200 else p["content"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
