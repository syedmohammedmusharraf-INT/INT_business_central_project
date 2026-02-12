import chromadb
from collections import defaultdict
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
import os

print("\nConnecting to Chroma...")

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

def chunk_text(text: str, chunk_size: int = 100, overlap: int = 20) -> list[str]:
    """
    Splits text into chunks of `chunk_size` words with `overlap` words between chunks.
    Returns a list of text chunks.
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


client = chromadb.PersistentClient(path="VECTOR_DB_updated/chroma_store")


# print("\nCollections found:")
# for c in client.list_collections():
#     print(" -", c.name)

FIELD_COLLECTIONS = {
    "service_identity": "service_identity",
    "service_capabilities": "service_capabilities",
    "service_technologies": "service_technologies",
    "service_intent": "service_intent",
    "service_problems": "service_problems",
    "service_industries": "service_industries",
    "service_usecases": "service_usecases",
    "service_figures": "service_figures",
    "service_constraints": "service_constraints"
}

collections = {name: client.get_collection(name, embedding_function=embedding_fn)
               for name in FIELD_COLLECTIONS}

# Pick one known collection
# col = client.get_collection("service_capabilities", embedding_function=embedding_fn)

# print("\nCollection size:", col.count())

# Try a real text query
query_text = """We are looking for an AI-driven automation service that helps organizations reduce manual operational effort and improve efficiency by automating document-heavy workflows.

The service should be capable of processing unstructured and semi-structured data, extracting information using AI techniques such as OCR, NLP, or machine learning, and integrating with existing enterprise systems.

The solution should support measurable business outcomes such as faster processing time, cost reduction, improved accuracy, and scalability. It should be applicable across industries like finance, healthcare, insurance, or enterprise operations.

We are interested in services that provide clear use cases, practical implementation scenarios, and defined capabilities, along with transparency around technical prerequisites, limitations, and constraints.
"""

#print("\nRunning semantic query:", query_text)

# result = col.query(
#     query_texts=[query_text],
#     n_results=5,
#     include=["documents", "distances", "metadatas"]
# )


# def semantic_search_all_fields(query_text: str, top_k: int = 5):
#     service_scores = defaultdict(list)

#     for field, collection_name in FIELD_COLLECTIONS.items():
#         collection = client.get_collection(
#             collection_name,
#             embedding_function=embedding_fn
#         )

#         result = collection.query(
#             query_texts=[query_text],
#             n_results=top_k,
#             include=["distances", "metadatas"]
#         )

#         distances = result["distances"][0]
#         metadatas = result["metadatas"][0]

#         for d, meta in zip(distances, metadatas):
#             service = meta.get("service")
#             cosine_similarity = round(1 - d, 4)

#             service_scores[service].append({
#                 "field": field,
#                 "score": cosine_similarity
#             })

#     return service_scores

# def aggregate_service_scores(service_scores: dict):
#     aggregated = {}

#     for service, scores in service_scores.items():
#         values = [s["score"] for s in scores]

#         aggregated[service] = {
#             "final_score": round(sum(values) / len(values), 4),
#             "field_breakdown": scores
#         }

#     return dict(
#         sorted(
#             aggregated.items(),
#             key=lambda x: x[1]["final_score"],
#             reverse=True
#         )
#     )
# def print_ranked_results(ranked_results, top_n=5):
#     print("\n===== RANKED SERVICE MATCHES =====\n")

#     for idx, (service, data) in enumerate(list(ranked_results.items())[:top_n], start=1):
#         print(f"{idx}. Service: {service}")
#         print(f"   Final Cosine Score: {data['final_score']:.4f}")

#         print("   Field-wise similarity:")
#         for field_score in data["field_breakdown"]:
#             print(
#                 f"     - {field_score['field']}: "
#                 f"{field_score['score']:.4f}"
#             )

#         print("-" * 50)



# raw_results = semantic_search_all_fields(query_text)
# ranked_results = aggregate_service_scores(raw_results)
# print_ranked_results(ranked_results, top_n=5)

def query_vector_db(query_text: str, top_k: int = 5):
    chunks = chunk_text(query_text, chunk_size=100, overlap=20)
    combined_scores = defaultdict(list)

    for chunk in chunks:
        for field, collection in collections.items():
            result = collection.query(
                query_texts=[chunk],
                n_results=top_k,
                include=["distances", "metadatas", "documents"]
            )

            distances = result["distances"][0]
            metas = result["metadatas"][0]
            docs = result["documents"][0]

            for d, m, doc in zip(distances, metas, docs):
                service = m.get("service", "UNKNOWN")
                cosine_similarity = 1 - d
                combined_scores[service].append({
                    "field": field,
                    "chunk_text": chunk,
                    "matched_doc": doc,
                    "cosine_similarity": cosine_similarity
                })

    # Average scores for each service
    final_scores = {}
    for service, matches in combined_scores.items():
        avg_score = sum([m["cosine_similarity"] for m in matches]) / len(matches)
        final_scores[service] = round(avg_score * 100, 2)

    # Sort descending
    ranked = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
    return ranked, combined_scores

#ranked_results, detailed_matches = query_vector_db(query_text)

for c in client.list_collections():
    col = client.get_collection(c.name, embedding_function=embedding_fn)
    print(c.name, "has", col.count(), "documents")


# print("\n--- Ranked Services ---")
# for service, score in ranked_results:
#     print(service, score)