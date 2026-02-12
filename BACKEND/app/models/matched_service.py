from pydantic import BaseModel
from typing import Optional

class MatchedService(BaseModel):

    # schema here to show the website results here in detail

    service: str
    cosine_similarity: float
    technologies: str
    capabilities: str
    intent: str
    identity: str
    problems: str
    industry: str

