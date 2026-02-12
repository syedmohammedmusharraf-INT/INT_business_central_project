from pydantic import BaseModel
from datetime import datetime

class Document(BaseModel):
    file_name: str
    file_path: str
    file_type: str
    uploaded_at: datetime
