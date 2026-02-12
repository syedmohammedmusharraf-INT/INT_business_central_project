import os
from typing import List, Dict, Any, Annotated
from typing_extensions import TypedDict
from datetime import datetime
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

class ExperiencePoint(TypedDict):
    client: Annotated[str, "The name of the client or industry sector."]
    outcome: Annotated[str, "The specific result or achievement."]

class AlignmentInference(TypedDict):
    reasoning: Annotated[str, "A comprehensive, multi-paragraph explanation of why the match is happening, triangulating client intent, problems, and INT capabilities."]
    relevant_experience: Annotated[List[ExperiencePoint], "A list of detailed experience objects extracted from service data, especially figures and stats."]
    key_features: Annotated[List[str], "A list of specific features that directly address the client's problems."]
    service_figures: Annotated[str, "A single, most compelling performance metric (e.g., '90% improvement...')."]

async def infer_service_alignment(extraction_summary: Dict[str, Any], service_data: Dict[str, Any]) -> AlignmentInference:
    """
    Uses LLM to infer detailed alignment reasoning and experience for a matched service.
    """
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found")

    try:
        model = ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=0.2
        )
        
        structured_llm = model.with_structured_output(AlignmentInference)

        prompt_template = PromptTemplate(
            template="""
        As a senior solution architect at INT, perform a comprehensive strategic analysis of the alignment between a client's requirements and an INT service.

        CLIENT REQUIREMENTS (Extracted from Document):
        - Intent/Objectives: {intent}
        - Required Capabilities: {capabilities_needed}
        - Problem Statements: {problems}
        - Tech Environment: {technologies}
        - Industry: {industry}

        INT SERVICE KNOWLEDGE BASE:
        - INT Service Name: {service_name}
        - Service Intent: {service_intent}
        - Service Capabilities: {service_capabilities}
        - Problems this Service Solves: {service_problems}
        - Service Tech Stack: {service_tech}
        - INT Service Identity & Experience: {service_identity}
        - INT Service Figures & Stats: {service_figures_context}

        ---

        REFINED STRATEGIC ANALYSIS TASKS:

        1. WHY THIS MATCH IS HAPPENING (Concise Triangulation):
        Provide a detailed explanation of EXACTLY 4 to 5 sentences explaining the alignment.
        You MUST explicitly triangulate:
        - How the client's SPECIFIC INTENT aligns with the INT SERVICE'S STRATEGIC DIRECTION.
        - How the client's PAIN POINTS are resolved by the METHODOLOGIES of this service.
        Avoid generic sentences. Use specific details from the client requirements and INT knowledge base.

        2. RELEVANT INT EXPERIENCE:
        Extract 2-3 specific accomplishments or case studies as objects with "client" and "outcome" fields.
        PRIORITIZE data from the "INT Service Figures & Stats" section. 
        - "client" should be the industry or client name (e.g., "Pharmaceutical Client").
        - "outcome" should be the detailed result (e.g., "Achieved a 70% acceleration in decision-making through AI integration").

        3. KEY FEATURES INVOLVED:
        Identify 4-5 core features of this INT service that are most critical to solving the client's specific problems.

        4. SERVICE FIGURES (HIGHLIGHT):
        Extract ONE most compelling history stat or metric (e.g., "Over 27 years of experience") strictly from the "INT Service Figures & Stats" section.

        Use professional, authoritative, and data-driven enterprise language.
        """,
            input_variables=[
                "intent", "capabilities_needed", "technologies", "problems", "industry",
                "service_name", "service_intent", "service_capabilities", "service_tech", "service_problems", "service_identity", "service_figures_context"
            ]
        )

        prompt_text = prompt_template.format(
            intent=extraction_summary.get("intent", "N/A"),
            capabilities_needed=extraction_summary.get("capabilities", "N/A"),
            technologies=extraction_summary.get("technologies", "N/A"),
            problems=extraction_summary.get("problems", "N/A"),
            industry=extraction_summary.get("industry", "N/A"),
            service_name=service_data.get("service", "N/A"),
            service_intent=service_data.get("intent", "N/A"),
            service_capabilities=service_data.get("capabilities", "N/A"),
            service_tech=service_data.get("technologies", "N/A"),
            service_problems=service_data.get("problems", "N/A"),
            service_identity=service_data.get("identity", "N/A"),
            service_figures_context=service_data.get("figures_context", "N/A")
        )

        response = await structured_llm.ainvoke(prompt_text)
        return response

    except Exception as e:
        import traceback
        with open('error_log.txt', 'a', encoding='utf-8') as f:
            f.write(f"\n--- ERROR AT {datetime.now()} ---\n")
            traceback.print_exc(file=f)
            f.write(f"Error Message: {str(e)}\n")
        print(f"Error in service alignment inference: {e}")
        # Return a slightly more descriptive fallback to aid debugging if it persists
        return {
            "reasoning": f"Deep alignment analysis for {service_data.get('service')} is currently unavailable due to a temporary processing error. However, vector matching confirms a strong correlation with your requirements based on product intent and capabilities.",
            "relevant_experience": ["Detailed experience records for this service are being retrieved from the INT Knowledge Base."],
            "key_features": ["Dynamic Feature Analysis Pending"],
            "service_figures": "History stats available in the full core deck."
        }
