from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate
import certifi
import os
from dotenv import load_dotenv
import pymupdf
from langchain_core.prompts import PromptTemplate
from typing import TypedDict,Annotated

load_dotenv()

def extract_pdf_pages(pdf_path: str) -> list[str]:
    """
    Extracts clean text from each page of a PDF.
    Returns a list of page texts.
    """
    doc = pymupdf.open(pdf_path)
    pages = []

    for page in doc:
        text = page.get_text("text")
        
        if text.strip():
            pages.append(text)

    return pages

model = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4o-mini",
    temperature=0
)

# STRUCTURED MODEL SCHEMA DEFINITION

class VectorDbSchema(TypedDict):
    service_identity= Annotated[str,"Provide the primary service overview from the given document"]
    service_capabilities = Annotated[str,"Provide the service description including the feature description and functional capabilities"]
    service_technologies = Annotated[str,"Provide the tech stack, frameworks , cloud platforms used in this service"]
    service_intent = Annotated[str,"Provide the pbusiness outcomes and goals achieved through this service"]
    service_problems = Annotated[str,"Provide the difficulties, problems does this service solves"]
    service_industries = Annotated[str,"Provide the industry specific use cases"]
    service_usecases = Annotated[str,"Provide the case studies and usecases of this service"]
    service_figures = Annotated[str,"Provide the performance metrics,benchmarks, competitive advantages"]
    service_constraints = Annotated[str,"describe the explicit limitations, prerequisites, assumptions, and conditions under which a service is effective, applicable, or not recommended."]

structured_model = model.with_structured_output(VectorDbSchema)

def vector_db_schema_from_doctext(text:str) -> VectorDbSchema:
    prompt = PromptTemplate(
        template="""

    You are given a company service document.

    Your task is to extract structured, factual information strictly from the document text and map it to the following fields.
    Do NOT infer, assume, or add information that is not explicitly stated.
    If a field is not clearly mentioned in the document, return:
    "Not specified in the document."

    GENERAL RULES:
    - Be concise and factual.
    - Do not infer new keys by own.Strictly follow the schmea keys mentioned.
    - Use plain text (no markdown, no bullet symbols).
    - Avoid marketing language.
    - Do not repeat the same sentence across multiple fields.
    - Each field should contain 2–4 clear sentences unless the document provides less information.

    FIELD DEFINITIONS:

    1. service_identity  
    Provide the primary service overview from the document.  
    Explain what the service is, what it offers at a high level, and who it is for.

    2. service_capabilities  
    Provide the service description including feature descriptions and functional capabilities.  
    Focus on what the service can actually do operationally or functionally.

    3. service_technologies  
    Provide the technologies used to implement the service.  
    Include tech stack, frameworks, platforms, cloud services, tools, or AI models explicitly mentioned.

    4. service_intent  
    Provide the business outcomes and goals achieved through this service.  
    Explain why the service exists and what business value or outcomes it aims to deliver.

    5. service_problems  
    Provide the difficulties or problems that this service solves.  
    Focus on pain points, inefficiencies, or challenges explicitly addressed.

    6. service_industries  
    Provide the industry-specific applicability or use cases.  
    Mention industries, domains, or sectors where the service is applied.

    7. service_usecases  
    Provide real or described use cases, scenarios, or case studies from the document.  
    Explain how the service is used in practice.

    8. service_figures  
    Provide performance metrics, benchmarks, measurable outcomes, or competitive advantages if stated.  
    Only include quantified or clearly stated differentiators.

    9. service_constraints  
    Describe the explicit limitations, prerequisites, assumptions, or conditions under which the service is effective, applicable, or not recommended.  
    Include technical, operational, data, regulatory, or scale-related constraints only if explicitly mentioned.

    DOCUMENT TEXT:
    <<<
    {DOCUMENT_TEXT}
    >>>

    """,
        input_variables=["DOCUMENT_TEXT"]
    )
    response = structured_model.invoke(prompt.format(DOCUMENT_TEXT=text))
    return response


import re

SECTIONS = [
    "WHAT IT IS",
    "WHAT PROBLEMS IT SOLVES",
    "CORE CAPABILITIES",
    "DELIVERED BUSINESS VALUE",
    "TARGET USERS / INDUSTRIES",
    "TECHNOLOGIES / PLATFORMS",
    "NUMBERS & PROOF POINTS"
]

def slice_summary(text: str) -> dict:
    """
    Takes a structured business summary and returns
    clean semantic slices for vector embedding.
    """
    slices = {}

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    for i, section in enumerate(SECTIONS):
        start = text.find(section + ":")
        if start == -1:
            slices[section] = ""
            continue

        start += len(section) + 1

        if i + 1 < len(SECTIONS):
            end = text.find(SECTIONS[i+1] + ":", start)
            if end == -1:
                end = len(text)
        else:
            end = len(text)

        content = text[start:end].strip()
        slices[section] = clean_slice(content)

    return slices


def clean_slice(content: str) -> str:
    """
    Remove bullets, excessive whitespace, and empty lines.
    Keep factual content intact.
    """
    lines = content.split("\n")

    cleaned = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        line = re.sub(r"^[\-\•\*]\s*", "", line)
        cleaned.append(line)

    return " ".join(cleaned)



import os
import chromadb
from chromadb.utils import embedding_functions
from langchain_core.prompts import PromptTemplate

# ---------- Setup ----------
KB_DIR = "INT_Services_KB"

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

client = chromadb.PersistentClient(path="VECTOR_DB/chroma_store")

collections = {
    "WHAT IT IS": client.get_or_create_collection("service_identity", embedding_function=embedding_fn),
    "WHAT PROBLEMS IT SOLVES": client.get_or_create_collection("service_problems", embedding_function=embedding_fn),
    "CORE CAPABILITIES": client.get_or_create_collection("service_capabilities", embedding_function=embedding_fn),
    "DELIVERED BUSINESS VALUE": client.get_or_create_collection("service_outcomes", embedding_function=embedding_fn),
    "TARGET USERS / INDUSTRIES": client.get_or_create_collection("service_industries", embedding_function=embedding_fn),
    "TECHNOLOGIES / PLATFORMS": client.get_or_create_collection("service_technologies", embedding_function=embedding_fn),
    "NUMBERS & PROOF POINTS": client.get_or_create_collection("service_proof", embedding_function=embedding_fn)
}

# ---------- Loop through PDFs ----------
for file in os.listdir(KB_DIR):

    if not file.lower().endswith(".pdf"):
        continue

    pdf_path = os.path.join(KB_DIR, file)
    service_name = os.path.splitext(file)[0]

    print("Processing:", service_name)

    # 1. Extract text (you already have this logic)
    text_pages = extract_pdf_pages(pdf_path)   # returns list[str]

    # 2. Create structured business summary
    response = model.invoke(
        prompt.format(TEXT_LIST="\n\n".join(text_pages))
    )

    structured_summary = response.content

    # 3. Slice into semantic fields
    slices = slice_summary(structured_summary)

    # 4. Store slices into vector DB
    for section, text in slices.items():
        if not text.strip():
            continue

        collections[section].add(
            documents=[text],
            ids=[f"{service_name}_{section}"],
            metadatas=[{
                "service": service_name,
                "source_pdf": file,
                "version": "v1"
            }]
        )

    print("Embedded:", service_name)

print("All PDFs processed.")
