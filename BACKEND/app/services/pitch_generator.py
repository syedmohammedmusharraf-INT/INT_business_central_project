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

    audience_map = {
        "c-level": "C-Level Executives (CEO, CTO, CFO). Focus on high-level strategic value, ROI, and long-term business impact.",
        "technical": "Technical Decision Makers (VP Engineering, Tech Leads). Emphasize architecture, scalability, security, and technical integration details.",
        "business": "Business Stakeholders (Product Managers, Operations). Balance operational efficiency, user experience, and market competitiveness."
    }

    tone_map = {
        "professional": "Professional, authoritative, and value-driven. Use industry-standard terminology.",
        "consultative": "Consultative and collaborative. Frame solutions as a partnership to solve specific challenges.",
        "technical": "Highly technical and analytical. Focus on hard data, specifications, and implementation details."
    }

    length_instructions = {
        "brief": "Keep the proposal concise (200-300 words). Focus only on the most critical value points.",
        "standard": "Provide a balanced overview (300-500 words) with sufficient detail for each section.",
        "detailed": "Provide a comprehensive, in-depth proposal (500-800 words) with detailed analysis and specific examples."
    }

    try:
        model = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=0.3
        )

        prompt_template = PromptTemplate(
            template="""
        Target Audience: {audience_desc}
        Tone: {tone_desc}
        Length Guidelines: {length_desc}
        Focus Areas: {focus_areas}

        ---
        Client Profile
        --------------
        Company: {company_name} ({company_size})
        Industry: {industry}
        Technology Stack: {tech_stack}

        Lead Intelligence Context
        -------------------------
        Primary Pain Points: {pain_points}
        Current Systems/Identity: {business_identity}
        Strategic Intent: {business_intent}

        Engagement Details
        ------------------
        Selected Services: {selected_services}
        Budget Constraint: {budget}
        Timeline Expectation: {timeline}

        ---
        Instructions:
        1. Generate a structured enterprise proposal for the specified Target Audience.
        2. Strictly adhere to the requested Tone and Length Guidelines.
        3. Heavily emphasize the Selected Focus Areas ({focus_areas}) throughout the proposal.
        4. Match the technical depth to the audience (e.g., more architectural detail for Technical leads, more ROI for C-Level).
        5. Do NOT use marketing fluff, emojis, or email-style formatting.
        6. Use the provided Client Profile and Intelligence Context to make the proposal highly personalized.

        Output Format:
        # EXECUTIVE SUMMARY
        [High-level value proposition tailored to {pitch_audience}]

        # 1. BUSINESS CONTEXT & STRATEGIC VISION
        [Analysis of {company_name}'s current market position and objectives]

        # 2. CHALLENGES & GAP ANALYSIS
        [Specific breakdown of {pain_points} and the risks of inaction]

        # 3. PROPOSED SOLUTION: {focus_areas_title}
        [Deep dive into how {selected_services} solve their specific problems, focusing on {focus_areas}]

        # 4. TECHNICAL ARCHITECTURE & INTEGRATION STRATEGY
        [Deployment details aligned with {tech_stack}]

        # 5. IMPLEMENTATION ROADMAP & MILESTONES
        [Phased approach targeting the {timeline} timeline]

        # 6. INVESTMENT & ROI PROJECTION
        [Strategic financial breakdown and expected business outcomes]

        # 7. CONCLUSION & NEXT STEPS
        [Call to action for {pitch_audience}]
        """,
            input_variables=[
                "company_name", "industry", "company_size", "pain_points", 
                "business_identity", "business_intent", "selected_services", 
                "tech_stack", "budget", "timeline", 
                "audience_desc", "tone_desc", "length_desc", "focus_areas", 
                "pitch_audience", "focus_areas_title"
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
            audience_desc=audience_map.get(config.audience, config.audience), # mapping from frontend to the mapping in the backend
            tone_desc=tone_map.get(config.tone, config.tone),
            length_desc=length_instructions.get(config.length, "Standard length"),
            focus_areas=", ".join(config.focusAreas),
            pitch_audience=config.audience.capitalize(),
            focus_areas_title=" & ".join([fa.replace('_', ' ').title() for fa in config.focusAreas])
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
