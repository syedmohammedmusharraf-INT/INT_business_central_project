from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.website_extractor import async_run_extract_website_content


router = APIRouter()

# REQUEST SCHEMA
class WebsiteRequest(BaseModel):
    website_url: str

@router.post("/extract-website")
async def extract_linkedin(request: WebsiteRequest):
    
    try:
        profile_data = await async_run_extract_website_content(request.website_url)
        if not profile_data:
            raise HTTPException(status_code=404, detail="Failed to extract website profile")
        return profile_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
