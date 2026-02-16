from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PitchConfig(BaseModel):
    audience: str
    tone: str
    length: str
    focusAreas: List[str]

class PitchCreate(BaseModel):
    lead_id: str
    selected_services: List[str]
    config: PitchConfig

class PitchRegenerate(BaseModel):
    pitch_id: str
    user_feedback: str

class PitchDB(BaseModel):
    id: str = Field(default_factory=lambda: None, alias="_id")
    lead_id: str
    company_name: str
    industry: str
    content: str
    config: Dict[str, Any]
    services: List[str]
    generated_by: str = "Sarah Johnson"
    version: int = 1
    status: str = "Active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
