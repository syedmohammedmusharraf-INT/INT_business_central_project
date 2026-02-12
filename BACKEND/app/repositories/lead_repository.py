from app.core.database import get_db
from datetime import datetime
from bson import ObjectId

db = get_db()
collection = db.leads

async def create_lead(data: dict):
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    result = await collection.insert_one(data)
    return str(result.inserted_id)

async def get_lead(lead_id: str):
    lead = await collection.find_one({"_id": ObjectId(lead_id)})
    if lead:
        lead["_id"] = str(lead["_id"])
    return lead


async def add_contact(lead_id: str, contact: dict):
    return await collection.update_one(
        {
            "_id": ObjectId(lead_id)},
        {
            "$push": {"contacts": contact},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
