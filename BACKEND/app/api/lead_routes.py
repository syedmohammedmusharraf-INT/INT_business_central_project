from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Annotated
from pydantic import Json
from bson import ObjectId
from pathlib import Path
from datetime import datetime, timezone
import shutil
import json



from app.core.database import get_db
from app.models.lead_schema import LeadCreate

router = APIRouter()

BASE_DIR = Path("data_lead_documents")



# -----------------------------
# CREATE LEAD + UPLOAD FILES
# -----------------------------
@router.post("/leads")
async def create_lead(
    lead_data: str = Form(..., description="JSON string of LeadCreate schema"),
    files: list[UploadFile] = File([])
):
    db = get_db()
    
    # Parse the JSON string manually back into a dict/model
    try:
        payload_dict = json.loads(lead_data)
        lead_model = LeadCreate(**payload_dict)
        payload = lead_model.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in lead_data: {str(e)}")

    # -----------------------------
    # 1. Resolve or create company
    # -----------------------------
    company_payload = payload.pop("company")
    company_key = company_payload["website"].lower() # company website is the primary key now

    company = await db.companies.find_one({"website": company_key})

    if not company:
        result = await db.companies.insert_one({
            "name": company_payload["name"],
            "website": company_key,
            # "industries": company_payload["industries"],
            "size": company_payload["size"],
            "created_at": datetime.now(timezone.utc)
        })
        company_id = result.inserted_id
        company = await db.companies.find_one({"_id": company_id})
    else:
        company_id = company["_id"]

    # -----------------------------
    # 2. Create Lead
    # -----------------------------
    lead_doc = {
        "company_id": company_id,
        "business_context": payload["business_context"],
        "contacts": payload["contacts"],
        "sales_qualification": payload["sales_qualification"],
        "documents": [],
        "industry": payload["business_context"].get("industry"),
        "score": 0.0,
        "owner": "Sarah Johnson",
        "matched_services": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await db.leads.insert_one(lead_doc)
    lead_id = result.inserted_id

    # -----------------------------
    # 3. Handle File Extraction (In-Memory)
    # -----------------------------
    from app.utils.text_extractor import extract_text_from_bytes
    
    lead_documents = []
    
    for file in files:
        doc_id = ObjectId()
        # Read file bytes for in-memory extraction
        file_content = await file.read()
        extracted_text = extract_text_from_bytes(file_content, file.filename)
        
        lead_documents.append({
            "_id": doc_id,
            "original_name": file.filename,
            "file_type": file.content_type,
            "extracted_text": extracted_text, # STORES THE TEXT DIRECTLY
            "uploaded_at": datetime.now(timezone.utc)
        })

    # -----------------------------
    # 4. Attach documents to lead
    # -----------------------------
    await db.leads.update_one(
        {"_id": lead_id},
        {"$set": {"documents": lead_documents}}
    )

    return {
        "lead_id": str(lead_id),
        "company_id": str(company_id)
    }

# -----------------------------
# GET LEAD
# -----------------------------
@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str):
    db = get_db()

    try:
        lead = await db.leads.find_one({"_id": ObjectId(lead_id)})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lead ID")

    company = await db.companies.find_one({"_id": lead["company_id"]})

    return {
        "id": str(lead["_id"]),
        "companyName": company["name"],
        "industry": lead.get("industry") or lead["business_context"].get("industry"),
        "companySize": company["size"],
        "website": company["website"],
        "budget": lead["business_context"]["estimated_budget"],
        "timeline": lead["business_context"]["timeline"],
        "painPoints": lead["business_context"]["pain_points_requirements_text"],
        "score": lead.get("score", 0),
        "profileScore": lead.get("profile_score", 0),
        "finalScore": lead.get("final_score", 0),
        "qualificationDecision": lead.get("qualification_decision", "Proceed"),
        "validationStatus": lead.get("validation_status", "pending"),
        "lastError": lead.get("last_error"),
        "profileValidation": lead.get("profile_validation"),
        "owner": lead.get("owner", "Sarah Johnson"),
        "matched_services": lead.get("matched_services", []),
        "createdAt": lead["created_at"].isoformat()
    }

# -----------------------------
# LIST LEADS
# -----------------------------
@router.get("/leads")
async def list_leads():
    db = get_db()
    leads = await db.leads.find().sort("created_at", -1).to_list(100)
    
    results = []
    for lead in leads:
        company_id = lead.get("company_id")
        company = None
        if company_id:
            company = await db.companies.find_one({"_id": company_id})
            
        results.append({
            "id": str(lead["_id"]),
            "companyName": company["name"] if company else lead.get("company_name", "Unknown"),
            "industry": lead.get("industry") or (lead["business_context"].get("industry") if "business_context" in lead else "Unknown"),
            "score": lead.get("score", 0),
            "owner": lead.get("owner", "Sarah Johnson"),
            "status": lead.get("sales_qualification", {}).get("lead_source", "New"),
            "servicesCount": len(lead.get("matched_services", [])),
            "createdAt": lead["created_at"].isoformat()
        })
    return results

