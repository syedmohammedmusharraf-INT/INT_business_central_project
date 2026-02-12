from pydantic import BaseModel
from typing import Optional

class BusinessContext(BaseModel):
    estimated_budget: str
    industry: str
    timeline: str
    pain_points_requirements_text: str
