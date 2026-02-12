from pydantic import BaseModel

class SalesQualification(BaseModel):
    lead_source: str
    additional_note: str
