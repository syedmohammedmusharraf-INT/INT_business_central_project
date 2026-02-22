from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.lead_routes import router as lead_router
from app.api.intelligence_route import router as intelligence_router
from app.api.linkedin_routes import router as linkedin_router
from app.api.website_extract_routes import router as website_router
from app.api.health import router as health_router

# Add the 'title' parameter here
app = FastAPI(
    title="INT Business Central"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router,tags=["Health"])
app.include_router(lead_router, tags=["Leads"])
app.include_router(intelligence_router, tags=["Intelligence"])
app.include_router(linkedin_router, tags=["LinkedIn"])
app.include_router(website_router,tags=["Website"])
