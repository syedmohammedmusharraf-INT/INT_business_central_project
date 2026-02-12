from app.repositories.lead_repository import create_lead, get_lead, add_contact

async def create_new_lead(lead_data: dict):
    return await create_lead(lead_data)

async def get_lead_by_id(lead_id: str):
    return await get_lead(lead_id)

async def add_new_contact(lead_id: str, contact: dict):
    return await add_contact(lead_id, contact)
