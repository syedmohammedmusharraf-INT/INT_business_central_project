from datetime import datetime, timezone
from bson import ObjectId
from collections import defaultdict
from pypdf import PdfReader
import chromadb
from chromadb.utils import embedding_functions
import traceback
import os
from docx import Document
from dotenv import load_dotenv
import asyncio


# IMPORT FILES
from app.core.database import get_db
from app.services.pdf_summarizer import summarize_text
from app.services.structured_service_result import infer_service_alignment



load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# -----------------------------
# CHROMA SETUP
# -----------------------------
embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

# Get absolute path for ChromaDB
# Fallback to current working directory if not specified in .env
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH")
if CHROMA_DB_PATH:
    CHROMA_PATH = os.path.abspath(CHROMA_DB_PATH)
else:
    # Try CWD first as it's most reliable for local development
    CHROMA_PATH = os.path.join(os.getcwd(), "VECTOR_DB", "VECTOR_DB_updated", "chroma_store")

# Final verification/fallback
if not os.path.exists(CHROMA_PATH):
    # Try one more fallback using __file__ if CWD fails
    BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    FALLBACK_PATH = os.path.join(BACKEND_DIR, "VECTOR_DB", "VECTOR_DB_updated", "chroma_store")
    if os.path.exists(FALLBACK_PATH):
        CHROMA_PATH = FALLBACK_PATH

client = chromadb.PersistentClient(path=CHROMA_PATH)

# print("\n--- CHROMA DEBUG ---")
# print("Path:", CHROMA_PATH)
# print("Tenant:", client.tenant)
# print("Database:", client.database)
# print("Collections:", [c.name for c in client.list_collections()])
# print("-------------------\n")

collections = {
    "db_problems": client.get_collection("service_problems", embedding_function=embedding_fn),
    "db_capabilities": client.get_collection("service_capabilities", embedding_function=embedding_fn),
    "db_industries": client.get_collection("service_industries", embedding_function=embedding_fn),
    "db_technologies": client.get_collection("service_technologies", embedding_function=embedding_fn),
    "db_intent": client.get_collection("service_intent", embedding_function=embedding_fn),
    "db_identity": client.get_collection("service_identity", embedding_function=embedding_fn),
    "db_figures": client.get_collection("service_figures", embedding_function=embedding_fn),
    "db_service_name": client.get_collection("service_name", embedding_function=embedding_fn)
}
# -----------------------------
# MONGO FETCH
# -----------------------------
async def get_lead(lead_id):
    db = get_db()
    lead = await db.leads.find_one({"_id": ObjectId(lead_id)})

    if not lead:
        raise ValueError("Lead not found in MongoDB")

    return lead

def normalize_to_string(value) -> str:
    """
    Ensures the output is always a clean string.
    Handles list, string, None safely.
    """
    if isinstance(value, list):
        return " ".join(str(v).strip() for v in value if v)
    if isinstance(value, str):
        return value.strip()
    return ""

# -----------------------------
# RUN VECTOR MATCHING
# -----------------------------
def run_matching(lead):
    print("\n--- RUN COSINE MATCHING (DATABASE MODE) ---")

    if not lead.get("documents"):
        raise ValueError("No documents attached to this lead")

    # Get extracted text from the first document in database
    raw_text = lead["documents"][0].get("extracted_text", "")

    if not raw_text.strip():
        raise ValueError("No extracted text found in lead document")

    summary = summarize_text(raw_text)

    if not summary:
        raise ValueError("Summarization failed")

    print("Structured summary keys:", summary.keys())
    for key, val in summary.items():
        print(f"\n[SUMMARY DEBUG] {key.upper()}:\n{val}\n")

    # field name ---> collection name
    field_collection_map = {
        "technologies": "db_technologies",
        "capabilities": "db_capabilities",
        "intent": "db_intent",
        "identity": "db_identity",
        "industry": "db_industries",   # singular on left, plural only in DB name
        "problems": "db_problems"
    }

    service_scores = defaultdict(list)

    for field, collection_name in field_collection_map.items():
        value = normalize_to_string(summary.get(field))  # fetching the summary key and convert into string

        if not value:
              continue

        result = collections[collection_name].query(
            query_texts=[value],
            n_results=5,
            include=["distances", "metadatas"]
        )

        distances = result["distances"][0]
        metas = result["metadatas"][0]

        for d, m in zip(distances, metas):
            service = m.get("service")
            cosine_similarity = 1 - d
            service_scores[service].append(cosine_similarity)

    return service_scores, summary

# -----------------------------
# SAFE CHROMA TO SCORES
# -----------------------------
def chroma_to_scores(chroma_result):
    scores = defaultdict(float)

    distances = chroma_result.get("distances", [[]])[0]
    metas = chroma_result.get("metadatas", [[]])[0]

    for d, m in zip(distances, metas):
        similarity = 1 - d
        service = m.get("service", "UNKNOWN")
        scores[service] += similarity

    return scores


def merge_scores(*dicts):
    merged = defaultdict(float)
    for d in dicts:
        for k, v in d.items():
            merged[k] += v
    return merged


# -----------------------------
# FINAL SCORING
# -----------------------------
def average_cosine_scores(service_scores):
    averaged = {}

    for service, scores in service_scores.items():
        if scores:
            averaged[service] = round(100*(round(sum(scores) / len(scores), 4)))

    return dict(sorted(averaged.items(), key=lambda x: x[1], reverse=True))


def fetch_service_profile(service_name: str):
    profile = {}

    mapping = {
        "db_technologies": "technologies",
        "db_capabilities": "capabilities",
        "db_intent": "intent",
        "db_identity": "identity",
        "db_industries": "industry",
        "db_problems": "problems",
        "db_figures": "figures_context",
        "db_service_name": "display_name"
    }

    for db_key, logical_key in mapping.items():
        collection = collections[db_key]
        result = collection.get(where={"service": service_name}, include=["documents"])
        # Join all matching document chunks into one string for better context
        profile[logical_key] = "\n".join(result["documents"]) if result["documents"] else ""

    return profile

# ---------------------------------------
# MAIN ENTRY POINT: SERVICE ALIGNMENT
# ---------------------------------------
async def generate_service_alignment(lead_id: str):
    """
    Handles the core service alignment logic: document processing, 
    vector matching, and service inference.
    """
    try:
        print("\n==== SERVICE ALIGNMENT START ====")

        lead = await get_lead(lead_id)
        
        # Run vector matching (includes doc extraction and summarization)
        loop = asyncio.get_running_loop()
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor() as executor:
            matching_results = await loop.run_in_executor(executor, run_matching, lead)

        service_scores, summary = matching_results
        ranked_scores = average_cosine_scores(service_scores)

        # Service Inference
        final = []
        inference_tasks = []
        matched_results_metadata = []

        for service, score in list(ranked_scores.items())[:5]:
            profile = fetch_service_profile(service)
            service_data = {
                "service": service,
                "technologies": profile.get("technologies", ""),
                "capabilities": profile.get("capabilities", ""),
                "intent": profile.get("intent", ""),
                "problems": profile.get("problems", ""),
                "industry": profile.get("industry", ""),
                "identity": profile.get("identity", ""),
                "figures_context": profile.get("figures_context", "")
            }
            inference_tasks.append(infer_service_alignment(summary, service_data))
            matched_results_metadata.append({"service": service, "score": score, "profile": profile})

        inference_results = await asyncio.gather(*inference_tasks, return_exceptions=True)

        for meta, inference in zip(matched_results_metadata, inference_results):
            service = meta["service"]
            score = meta["score"]
            profile = meta["profile"]

            if isinstance(inference, Exception):
                reasoning = f"Matched based on {score}% similarity. Detailed analysis delayed."
                experience, features, figures = [], [], ""
            else:
                reasoning = inference.get('reasoning', "")
                experience = inference.get('relevant_experience', [])
                features = inference.get('key_features', [])
                figures = inference.get('service_figures', "")

            final.append({
                "service": service,
                "display_name": profile.get("display_name", service),
                "cosine_similarity": score,
                "reasoning": reasoning,
                "relevant_experience": experience,
                "key_features": features,
                "service_figures": figures
            })

        # Calculate alignment score
        alignment_score = float(list(ranked_scores.values())[0]) if ranked_scores else 0.0
        
        # Save to DB (only alignment portion)
        db = get_db()
        await db.leads.update_one(
            {"_id": ObjectId(lead_id)},
            {
                "$set": {
                    "score": alignment_score,
                    "matched_services": final,
                    "extraction_summary": summary,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        return final

    except Exception as e:
        traceback.print_exc()
        raise e
