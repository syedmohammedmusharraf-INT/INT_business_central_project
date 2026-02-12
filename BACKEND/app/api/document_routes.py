from fastapi import APIRouter, UploadFile, File
from app.core.database import get_db
from bson import ObjectId
from datetime import datetime
from pathlib import Path
import shutil
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException


router = APIRouter()
db = get_db()
collection = db.leads

# base directory where lead documents will be stored
BASE_DIR = Path("data_lead_documents")

@router.post("/leads/{lead_id}/documents")

# --------- first based on lead added to db object id returned by mongo. now based on that monogo id we can filter the collection and append the metadata there -----------------------------------

async def upload_document(lead_id: str, file: UploadFile = File(...)): 
                          # file = Optional[UploafFile]= File(None)):

    # if not file:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="File is missing"
    #     )

    mongo_doc_id = ObjectId()   # mongo creates a document id here

    lead = await collection.find_one({"_id": ObjectId(lead_id)}) # filter out the lead based on lead_id
    company_name = lead["company"]["name"].replace(" ", "_")

    # directory and file name setup
    lead_dir = BASE_DIR / lead_id
    lead_dir.mkdir(parents=True, exist_ok=True)
    final_name = f"{mongo_doc_id}__{company_name}__{file.filename}"
    file_path = lead_dir / final_name

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    doc_record = {
        "_id": mongo_doc_id, # id generated for this pdf file
        "file_name": file.filename,
        "file_path": str(file_path),
        "file_type": file.content_type,
        "uploaded_at": datetime.now(timezone.utc)
    }

    await collection.update_one(
        {"_id": ObjectId(lead_id)},
        {"$push": {"documents": doc_record}}
    )

    return {
        "document_id": str(mongo_doc_id),
        "file_name": file.filename
    }
