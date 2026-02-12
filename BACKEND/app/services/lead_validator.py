import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

load_dotenv()

class ProfileValidation(BaseModel):
    company_match_score: int = Field(description="Score (0-100) for how well the person's current experience matches the lead company.")
    designation_score: int = Field(description="Score (0-100) based on the person's authority (C-level, VP, Director etc.).")
    content_relevance_score: int = Field(description="Score (0-100) for how relevant their posts are to the requirement text.")
    total_profile_score: int = Field(description="Weighted average score (0-100). Default weights: Company 30%, Designation 30%, Content 40%.")
    reasoning: str = Field(description="Brief explanation of the scoring.")
    designation: str = Field(description="The primary designation found.")
    is_decision_maker: bool = Field(description="Whether the person is likely a decision maker.")

async def validate_lead_profile(linkedin_data: Dict[str, Any], lead_context: Dict[str, Any]) -> ProfileValidation:
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
    
    structured_llm = model.with_structured_output(ProfileValidation)

    prompt = PromptTemplate(
        template="""
        As a sales intelligence expert, validate a contact's LinkedIn profile against a company's lead requirements.

        TARGET COMPANY & REQUIREMENTS:
        - Company Name: {company_name}
        - Industry: {industry}
        - Requirements/Pain Points: {requirements}

        EXTRACTED LINKEDIN DATA:
        - Name: {name}
        - Profile Bio/Summary: {bio}
        - Recent Posts: {posts}
        - Experience: {experience}
        - Skills: {skills}

        TASKS:
        1. **Company Match**: Does the experience section confirm they are CURRENTLY at {company_name}? (Weight 30%)

        2. **Designation Analysis**: Based on the individual’s current designation, profile bio, and listed work experience, evaluate whether they have decision-making authority for business or economic decisions within their organization. Give higher consideration to roles such as Founder, Co-Founder, Partner, C-Suite, VP, Head, or Director, and assess whether the bio or experience indicates ownership of strategy, budgets, hiring, partnerships, or organizational roadmaps.Reduce the score for roles that appear primarily execution-focused or individual-contributor in nature unless leadership or ownership responsibility is clearly stated. Return a decision-making authority score between 0 and 1, along with a brief justification, and ensure this score contributes a 30% weight to the overall client evaluation.

        3. **Content Relevance**:Strictly evaluate whether the individual’s recent LinkedIn posts explicitly indicate, discuss, or align with the stated requirements {requirements}.Focus on the actual language used in the post content rather than inferred intent. Check for direct keyword matches, closely related terminology, and clear semantic references that describe the same problems, solutions, technologies, or business needs as the stated requirements. Do not assign high scores based on generic industry talk, indirect associations, or speculative interpretation. Increase the score only when the post text clearly discusses or demonstrates engagement with the same requirement themes. Return a normalized requirement-alignment score between 0 and 1, include a brief justification referencing specific post wording or themes, and ensure this score contributes a 40% weight to the overall client evaluation.
        

        Return a structured validation result.
        """,
        input_variables=["company_name", "industry", "requirements", "name", "bio", "posts", "experience", "skills"]
    )

    # Prepare inputs
    posts_str = "\n".join([f"- {p['content']}" for p in linkedin_data.get('posts', [])])
    
    formatted_prompt = prompt.format(
        company_name=lead_context.get('company_name', 'Unknown'),
        industry=lead_context.get('industry', 'Unknown'),
        requirements=lead_context.get('requirements', 'N/A'),
        name=linkedin_data.get('name', 'Unknown'),
        bio=linkedin_data.get('bio', ''),
        posts=posts_str,
        experience=linkedin_data.get('experience', ''),
        skills=linkedin_data.get('skills', '')
    )

    result = await structured_llm.ainvoke(formatted_prompt)
    return result
