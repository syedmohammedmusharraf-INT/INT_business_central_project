import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field


load_dotenv()

class ServiceRequirementMap(BaseModel):
    service_match_score: int = Field(description = "Score (0-100) for how well the requirement is matching with company ")
    reasoning : int = Field(description = "Give the output that teh output regarding matching")

async def validate_lead_profile(website_data: Dict[str, Any], lead_context: Dict[str, Any]) -> ServiceRequirementMap:

    """
    Analyzes LinkedIn data against lead requirements to score the profile.
    """

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found")

    model = ChatOpenAI(
        api_key=api_key,
        model="gpt-4o-mini",
        temperature=0
    )
    
    structured_llm = model.with_structured_output(ServiceRequirementMap)

    
    prompt = PromptTemplate(
        template="""
    You are a strict validation engine.

    Your task is to determine whether the given BUSINESS REQUIREMENTS
    are genuinely reflected on the COMPANY WEBSITE CONTENT.

    You must ONLY use the provided website content.
    Do NOT assume intent.
    Do NOT infer based on industry norms.
    Do NOT add external knowledge.

    -------------------------
    INPUT DATA
    -------------------------

    Company Name:
    {company_name}

    Business Requirements:
    {requirements}

    Website Scraped Content:
    {website_content}

    -------------------------
    VALIDATION TASKS
    -------------------------

    1. REQUIREMENT MATCH CHECK
    - Check whether the website content explicitly or implicitly supports the stated requirements.
    - Look for:
    • Mention of similar problems, services, products, or capabilities
    • Pain points, offerings, solutions, or strategic focus aligned with requirements
    - If nothing matches clearly, mark it as NOT MATCHED.

    2. EVIDENCE QUALITY
    Classify the match strength:
    - STRONG MATCH: Direct mention of the same requirement or solution
    - PARTIAL MATCH: Related concepts or adjacent offerings
    - WEAK MATCH: Vague or generic references
    - NO MATCH: No supporting evidence found

    3. AUTHENTICITY SIGNAL
    Determine whether the requirement appears:
    - Actively promoted on the website
    - Mentioned as a current focus
    - Only loosely implied
    - Not present at all

    -------------------------
    STRICT RULES
    -------------------------
    - If evidence is vague, score LOW.
    - If no evidence exists, explicitly say "No supporting evidence found".
    - Do NOT fabricate alignment.
    - Quote or paraphrase only from the website content.


    """,
        input_variables=[
            "company_name",
            "requirements",
            "website_content"
        ]
    )

    formatted_prompt = prompt.format(
        company_name=lead_context.get('company_name', 'Unknown'),
        requirements=lead_context.get('requirements', 'N/A'),
        posts=website_data
    )

    result = await structured_llm.ainvoke(formatted_prompt)
    return result