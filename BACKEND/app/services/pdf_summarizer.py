import os
from dotenv import load_dotenv
from typing import List, Dict
from typing import TypedDict,Annotated,Optional
from langchain_core.prompts import PromptTemplate
import certifi
from langchain_openai import ChatOpenAI

# ========================= ENV =========================
os.environ["SSL_CERT_FILE"] = certifi.where()
load_dotenv()

model = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4o-mini",
    temperature=0
)

# ====================== LEAD PDF EXTRACTION ===============================================

class Summarization(TypedDict):

    identity= Annotated[str,"Provide the primary service overview from the given document"]
    capabilities = Annotated[str,"Provide the service description including the feature description and functional capabilities"]
    technologies = Annotated[str,"Provide the tech stack, frameworks , cloud platforms used in this service"]
    intent = Annotated[str,"Provide the pbusiness outcomes and goals achieved through this service"]
    problems = Annotated[str,"Provide the difficulties, problems does this service solves"]
    industry = Annotated[str,"Provide the industry specific use cases"]


    # service_usecases = Annotated[str,"Provide the case studies and usecases of this service"]


    # service_figures = Annotated[str,"Provide the performance metrics,benchmarks, competitive advantages"]
    # service_constraints = Annotated[str,"describe the explicit limitations, prerequisites, assumptions, and conditions under which a service is effective, applicable, or not recommended."]



structured_model = model.with_structured_output(Summarization)

def summarize_text(text: str) -> Summarization:
    prompt = PromptTemplate(
    template =
      """
    You are a senior enterprise business analyst and solution architect.

    Analyze the following client requirement document and extract structured information.

    Document:
    {text}

    Extraction Guidelines:
    - Use ONLY information present in the document
    - Do not infer new keys by own.Strictly follow the schmea keys mentioned.
    - Do NOT infer, assume, or generalize beyond the text
    - Each field should be detailed but concise (2–4 sentences)
    - Prefer clear bullet-style phrasing within sentences
    - Maintain factual, neutral, business language

    FIELD DEFINITIONS:

    1. identity  
    Provide the primary service overview from the document.  
    Explain what the service is, what it offers at a high level, and who it is for.

    2. capabilities  
    Provide the service description including feature descriptions and functional capabilities.  
    Focus on what the service can actually do operationally or functionally.

    3. technologies  
    Provide the technologies used to implement the service.  
    Include tech stack, frameworks, platforms, cloud services, tools, or AI models explicitly mentioned.

    4. intent  
    Provide the business outcomes and goals achieved through this service.  
    Explain why the service exists and what business value or outcomes it aims to deliver.

    5. problems  
    Provide the difficulties or problems that this service solves.  
    Focus on pain points, inefficiencies, or challenges explicitly addressed.

    6. industry
    Provide the industry-specific applicability or use cases.  
    Mention industries, domains, or sectors where the service is applied.

    DO NOT rename keys.
    DO NOT add extra keys"""
    ,input_variables = ["text"])


    response = structured_model.invoke(prompt.format(text=text))
    return response


