import chromadb
import os
import sqlite3
from dotenv import load_dotenv

def diagnose():
    load_dotenv()
    BACKEND_DIR = os.path.abspath(os.curdir)
    CHROMA_PATH = os.path.join(BACKEND_DIR, "VECTOR_DB", "VECTOR_DB_updated", "chroma_store")
    SQLITE_PATH = os.path.join(CHROMA_PATH, "chroma.sqlite3")

    print(f"--- CHROMA DIAGNOSTIC ---")
    print(f"Chroma Path: {CHROMA_PATH}")
    print(f"SQLite Path: {SQLITE_PATH}")
    
    if not os.path.exists(SQLITE_PATH):
        print("ERROR: SQLite file not found!")
        return

    # Check SQLite for collections and segments
    try:
        conn = sqlite3.connect(SQLITE_PATH)
        cursor = conn.cursor()
        
        print("\n[Collections in SQLite]")
        cursor.execute("SELECT id, name FROM collections")
        collections = cursor.fetchall()
        for c_id, name in collections:
            print(f"- {name} (ID: {c_id})")
            
        print("\n[Segments in SQLite]")
        # Schema might be different, let's list tables first
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tables: {tables}")
        
        if "segments" in tables:
            cursor.execute("PRAGMA table_info(segments)")
            cols = [c[1] for c in cursor.fetchall()]
            print(f"Segment columns: {cols}")
            
            cursor.execute("SELECT * FROM segments")
            segments = cursor.fetchall()
            for s in segments:
                print(f"- Segment: {s}")
            
        conn.close()
    except Exception as e:
        print(f"ERROR reading SQLite: {e}")

    # Check folders on disk
    print("\n[Folders on Disk]")
    folders = [f for f in os.listdir(CHROMA_PATH) if os.path.isdir(os.path.join(CHROMA_PATH, f))]
    for f in folders:
        print(f"- {f}")

    # Try to initialize client
    try:
        from chromadb.utils import embedding_functions
        load_dotenv()
        embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY"),
            model_name="text-embedding-3-large"
        )
        
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        print("\n[Client Initialized Successfully]")
        
        for name in [c.name for c in client.list_collections()]:
            print(f"Checking collection: {name}")
            col = client.get_collection(name, embedding_function=embedding_fn)
            try:
                count = col.count()
                print(f"  Count: {count}")
                if count > 0:
                    print(f"  Peeking...")
                    col.peek(limit=1)
                    print(f"  Peek OK")
                    
                    print(f"  Querying...")
                    col.query(query_texts=["test"], n_results=1)
                    print(f"  Query OK")
            except Exception as e:
                print(f"  ERROR Querying/Peeking {name}: {e}")
                
    except Exception as e:
        print(f"\nFATAL: Client error: {e}")

if __name__ == "__main__":
    diagnose()
