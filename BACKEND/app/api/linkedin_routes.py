from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.linkedin_extractor import extract_linkedin_profile
from app.utils.linkedin_extractor import async_run_extract_linkedin_profile

router = APIRouter()

class LinkedInRequest(BaseModel):
    linkedin_url: str

@router.post("/extract-linkedin")
async def extract_linkedin(request: LinkedInRequest):
    
    try:
        profile_data = await async_run_extract_linkedin_profile(request.linkedin_url)
        if not profile_data:
            raise HTTPException(status_code=404, detail="Failed to extract LinkedIn profile")
        return profile_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
