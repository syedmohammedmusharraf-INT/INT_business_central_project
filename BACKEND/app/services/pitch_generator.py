import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.models.lead_schema import LeadDB
from app.models.pitch_schema import PitchConfig

load_dotenv()

async def generate_pitch_content(lead: Dict[str, Any], selected_services: List[str], config: PitchConfig) -> str:
    """
    Generates a tailored enterprise proposal using OpenAI gpt-4o-mini.
    Uses deep lead metadata and follows a strict professional structure.
    """
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _generate_fallback_pitch(lead, selected_services, config)

    try:
        model = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=0.7
        )

        prompt_template = PromptTemplate(
            template="""
        Client Information
        ------------------
        Company Name: {company_name}
        Industry: {industry}
        Company Size: {company_size}

        Lead Context
        ------------
        Pain Points:
        {pain_points}

        Current Systems:
        {business_identity}

        Business Objective:
        {business_intent}

        Selected Services from INT:
        {selected_services}

        Technology Environment:
        {tech_stack}

        Constraints:
        Budget: {budget}
        Timeline: {timeline}

        ---

        Using the above inputs, generate a structured enterprise proposal.

        Do NOT write marketing fluff.
        Do NOT write in email style.
        Do NOT use emojis.
        Use professional enterprise tone ({tone}).
        Focus Areas: {focus_areas}

        Populate each section realistically and in context of the client.

        Follow this output format exactly:

        # EXECUTIVE SUMMARY
        [Brief high-level summary of the strategic value proposition]

        # 1. BUSINESS CONTEXT & VISION
        [Analysis of the client's current state and long-term objectives]

        # 2. CHALLENGES & PAIN POINTS
        [Specific analysis of current difficulties as identified in context]

        # 3. PROPOSED SOLUTION: STRATEGIC ALIGNMENT
        [Detailed mapping of selected INT services to business needs]

        # 4. TECHNICAL ARCHITECTURE & INTEGRATION
        [Technical implementation plan aligned with their current environment]

        # 5. IMPLEMENTATION ROADMAP
        [Phased delivery approach based on the stated timeline]

        # 6. BUDGETARY CONSIDERATIONS
        [Strategic budget breakdown based on provided constraints]

        # 7. EXPECTED OUTCOMES & ROI
        [Quantifiable success metrics and strategic impact]
        """,
            input_variables=[
                "company_name", "industry", "company_size", "pain_points", 
                "business_identity", "business_intent", "selected_services", 
                "tech_stack", "budget", "timeline", "tone", "focus_areas"
            ]
        )

        prompt_text = prompt_template.format(
            company_name=lead.get("company_name", "your company"),
            industry=lead.get("industry", "your industry"),
            company_size=lead.get("company_size", "N/A"),
            pain_points=lead.get("pain_points", "N/A"),
            business_identity=lead.get("business_identity", "N/A"),
            business_intent=lead.get("business_intent", "N/A"),
            selected_services=", ".join(selected_services),
            tech_stack=lead.get("tech_stack", "N/A"),
            budget=lead.get("budget", "Not specified"),
            timeline=lead.get("timeline", "Flexible"),
            tone=config.tone,
            focus_areas=", ".join(config.focusAreas)
        )
        

        response = await model.ainvoke(prompt_text)
        return response.content.strip()

    except Exception as e:
        print(f"Error in dynamic pitch generation: {e}")
        return _generate_fallback_pitch(lead, selected_services, config)

def _generate_fallback_pitch(lead: Dict[str, Any], selected_services: List[str], config: PitchConfig) -> str:
    """Fallback generator in case of API failure."""
    company_name = lead.get("company_name", "your company")
    services_str = ", ".join(selected_services)
    
    return f"""
    # EXECUTIVE SUMMARY
    Strategic proposal for {company_name} focusing on {services_str}.

    # 1. BUSINESS CONTEXT & VISION
    {company_name} is seeking to modernize operations in the {lead.get('industry', 'current')} sector.

    # 2. CHALLENGES & PAIN POINTS
    Identified need to address: {lead.get('pain_points', 'operational efficiency')}.

    # 3. PROPOSED SOLUTION: STRATEGIC ALIGNMENT
    Deployment of {services_str} to drive digital transformation.

    # 4. TECHNICAL ARCHITECTURE & INTEGRATION
    Seamless integration with existing systems to ensure business continuity.

    # 5. IMPLEMENTATION ROADMAP
    Phased approach aligned with the {lead.get('timeline', 'requested')} timeline.

    # 6. BUDGETARY CONSIDERATIONS
    Project scoping tailored to {lead.get('budget', 'enterprise')} requirements.

    # 7. EXPECTED OUTCOMES & ROI
    Anticipated improvements in scalability, efficiency, and market positioning.
    """.strip()
