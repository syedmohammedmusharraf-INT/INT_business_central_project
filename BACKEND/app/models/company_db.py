from pydantic import BaseModel, Field
from datetime import datetime

class CompanyDB(BaseModel):
    id: str = Field(alias="_id")
    name: str
    website: str
    # industry: str
    size: str
    created_at: datetime
