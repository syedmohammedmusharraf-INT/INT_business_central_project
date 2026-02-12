import os
import json
import uuid
from typing import Dict
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

# -------------------------------------------------
# ENV SETUP
# -------------------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

JSON_FOLDER = "INT_experience_json_schema"
CHROMA_PATH = "VECTOR_DB_updated/chroma_store"

# -------------------------------------------------
# OPENAI EMBEDDING FUNCTION
# -------------------------------------------------
embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

# -------------------------------------------------
# CHROMA CLIENT
# -------------------------------------------------
client = chromadb.PersistentClient(path=CHROMA_PATH)

# -------------------------------------------------
# COLLECTION KEYS (STRICT)
# -------------------------------------------------
COLLECTION_KEYS = [
    "service_figures",
]

# -------------------------------------------------
# CREATE / LOAD COLLECTIONS
# -------------------------------------------------
collections: Dict[str, chromadb.Collection] = {}

for key in COLLECTION_KEYS:
    collections[key] = client.get_or_create_collection(
        name=key,
        embedding_function=embedding_fn
    )

print("✅ All collections initialized")

# -------------------------------------------------
# INGEST JSON FILES
# -------------------------------------------------
def ingest_json_file(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    service_name = os.path.splitext(os.path.basename(json_path))[0]

    for field in COLLECTION_KEYS:
        text = data.get(field, "").strip()

        if not text or text.lower().startswith("not specified"):
            continue

        collections[field].add(
            documents=[text],
            metadatas=[{
                "service": service_name,
                "field": field,
                "source_file": os.path.basename(json_path)
            }],
            ids=[f"{service_name}_{field}_{uuid.uuid4().hex}"]
        )

    print(f"✔ Ingested: {service_name}")

# -------------------------------------------------
# MAIN LOOP
# -------------------------------------------------
def ingest_all_jsons():
    for filename in os.listdir(JSON_FOLDER):
        if not filename.endswith(".json"):
            continue

        try:
            ingest_json_file(os.path.join(JSON_FOLDER, filename))
        except Exception as e:
            print(f"❌ Failed {filename}: {e}")

    print("\n🎉 Ingestion completed successfully")

# -------------------------------------------------
# RUN
# -------------------------------------------------
if __name__ == "__main__":
    ingest_all_jsons()
