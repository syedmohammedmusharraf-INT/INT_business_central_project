from pydantic import BaseModel
from typing import Optional

class Contact(BaseModel):
    name: str
    job_title: str
    email: str
    linkedin: Optional[str]
    is_primary: bool = False
