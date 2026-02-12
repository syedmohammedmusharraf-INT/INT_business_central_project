
import os
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

# Replicating logic from lead_intelligence.py
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BACKEND_DIR, "VECTOR_DB", "VECTOR_DB_updated", "chroma_store")

print(f"--- CHROMA PATH CHECK ---")
print(f"Path: {CHROMA_PATH}")
print(f"Exists: {os.path.exists(CHROMA_PATH)}")

if not os.path.exists(CHROMA_PATH):
    print("FATAL: Chroma path does not exist!")
    exit(1)

col_names = [
    "service_problems",
    "service_capabilities",
    "service_industries",
    "service_technologies",
    "service_intent",
    "service_identity",
    "service_figures",
    "service_name"
]

try:
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    available_cols = [c.name for c in client.list_collections()]
    print(f"Available collections: {available_cols}")
    
    for col_name in col_names:
        if col_name not in available_cols:
            print(f"[MISSING] {col_name}")
            continue
            
        try:
            print(f"Checking {col_name}...", end=" ", flush=True)
            col = client.get_collection(col_name, embedding_function=embedding_fn)
            # Use query with a zero vector or peek
            count = col.count()
            print(f"OK (count: {count})")
            
            if count > 0:
                print(f"  Peeking {col_name}...", end=" ", flush=True)
                col.peek(limit=1)
                print("OK")
                
                # Try a real query with a dummy string
                print(f"  Querying {col_name} with dummy text...", end=" ", flush=True)
                col.query(query_texts=["test"], n_results=1)
                print("OK")
                
        except Exception as e:
            print(f"FAILED!")
            print(f"Error checking {col_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            
except Exception as e:
    print("\n!!! CLIENT INITIALIZATION ERROR !!!")
    import traceback
    traceback.print_exc()
