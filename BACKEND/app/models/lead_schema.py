from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .company import Company
from .contact import Contact
from .sales_qualification import SalesQualification
from .documents import Document
from .business_context import BusinessContext



from .matched_service import MatchedService

class LeadCreate(BaseModel):
    company: Company
    business_context: BusinessContext
    contacts: List[Contact]
    sales_qualification: SalesQualification

class LeadDB(BaseModel):
    id: str = Field(alias="_id")
    company_id: str
    business_context: BusinessContext
    contacts: List[Contact]
    sales_qualification: SalesQualification
    documents: List[Document] = []
    
    # NEW FIELDS
    # NEW FIELDS
    industry: Optional[str] = None
    score: float = 0.0 # This is the service alignment score
    profile_score: float = 0.0 # This is the LinkedIn validation score
    final_score: float = 0.0 # Combined score
    qualification_decision: Optional[str] = None # "Proceed" or "Hold"
    owner: str = "Sarah Johnson" # Default for now
    matched_services: List[MatchedService] = []
    extraction_summary: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    updated_at: datetime



