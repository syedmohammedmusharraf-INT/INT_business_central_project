import chromadb

client = chromadb.PersistentClient(path="VECTOR_DB_updated/chroma_store")

collections = client.list_collections()

collection = client.get_collection("service_capabilities")


# for col in collections:
#     print(col.name)

results = collection.get(include=["metadatas", "documents"])
for i in range(len(results["ids"])):
    print("ID:", results["ids"][i])
    print("Metadata:", results["metadatas"][i])
    print("Document:", results["documents"][i])
    print("-" * 40)

