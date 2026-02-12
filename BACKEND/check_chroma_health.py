import chromadb
import os
from dotenv import load_dotenv

def check_collections():
    load_dotenv(r'c:\Users\Navvidha_Bharech\Desktop\INT Business Central Project\BACKEND\.env')
    path = "VECTOR_DB/VECTOR_DB_updated/chroma_store"
    print(f"Checking ChromaDB at: {os.path.abspath(path)}")
    
    if not os.path.exists(path):
        print(f"ERROR: Path does not exist: {path}")
        return

    client = chromadb.PersistentClient(path=path)
    collections = client.list_collections()
    
    print(f"Found {len(collections)} collections.")
    
    for coll in collections:
        print(f"\nCollection: {coll.name}")
        try:
            count = coll.count()
            print(f"  Count: {count}")
            # Try a small query to check index health
            if count > 0:
                print(f"  Testing query...")
                res = coll.peek(limit=1)
                print(f"  Peek success: {len(res['ids'])} items")
            else:
                print(f"  Warning: Collection is empty.")
        except Exception as e:
            print(f"  ERROR checking {coll.name}: {e}")

if __name__ == "__main__":
    check_collections()
