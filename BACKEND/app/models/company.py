from pydantic import BaseModel
from typing import Optional

class Company(BaseModel):
    name: str
    website:str
    size: str
