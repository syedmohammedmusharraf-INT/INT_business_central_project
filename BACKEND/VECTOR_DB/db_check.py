import os
from collections import defaultdict
from typing import Dict, List
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

# -------------------------------------------------
# ENV SETUP
# -------------------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CHROMA_PATH = "VECTOR_DB_updated/chroma_store"

# -------------------------------------------------
# EMBEDDING FUNCTION
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
# SCHEMA FIELDS
# -------------------------------------------------
COLLECTION_KEYS = [
    "service_identity",
    "service_capabilities",
    "service_technologies",
    "service_intent",
    "service_problems",
    "service_industries",
    "service_usecases",
    "service_figures",
    "service_constraints",
]

# -------------------------------------------------
# LOAD COLLECTIONS
# -------------------------------------------------
collections = {
    key: client.get_collection(
        name=key,
        embedding_function=embedding_fn
    )
    for key in COLLECTION_KEYS
}

# -------------------------------------------------
# QUERY JSON (INPUT)
# -------------------------------------------------
QUERY_SCHEMA = {
    "service_identity": (
        "A blockchain-based automation and data integrity platform designed to manage, verify, "
        "and automate enterprise workflows using decentralized ledgers. The service focuses on "
        "ensuring trust, transparency, and immutability across multi-party business processes."
    ),

    "service_capabilities": (
        "Automates transaction validation, record reconciliation, and audit logging using smart contracts. "
        "Enables real-time verification of business events, automated rule enforcement, and tamper-proof "
        "record management across distributed stakeholders."
    ),

    "service_technologies": (
        "Built using blockchain technologies such as Ethereum or Hyperledger, combined with smart contracts, "
        "distributed ledgers, cryptographic hashing, and consensus mechanisms. May integrate with APIs, "
        "enterprise systems, and off-chain data sources for hybrid architectures."
    ),

    "service_intent": (
        "Reduce dependency on manual verification and centralized intermediaries while improving operational trust. "
        "The service aims to increase transparency, reduce fraud, and enable automated compliance in "
        "multi-party enterprise workflows."
    ),

    "service_problems": (
        "Addresses issues such as lack of trust between organizations, data tampering, reconciliation delays, "
        "and manual audits. Solves inefficiencies caused by fragmented systems and opaque transaction histories."
    ),

    "service_industries": (
        "Applicable across industries such as finance, supply chain, insurance, healthcare, and enterprise operations "
        "where multiple parties need shared, verifiable records. Especially useful in regulated or audit-heavy domains."
    ),

    "service_usecases": (
        "Use cases include blockchain-based invoice verification, supply chain traceability, decentralized identity "
        "management, and automated settlement processes. Also supports cross-organization data sharing with "
        "immutable audit trails."
    ),

    "service_figures": (
        "Capable of processing and validating large volumes of transactions across distributed networks. "
        "Supports high integrity guarantees, reduced reconciliation time, and improved audit efficiency at scale."
    ),

    "service_constraints": (
        "Requires participating systems to integrate with blockchain networks and follow defined governance models. "
        "Performance may be constrained by network latency, transaction costs, and regulatory or data privacy considerations."
    )
}


# -------------------------------------------------
# MATCHING FUNCTION
# -------------------------------------------------
def match_services(top_k: int = 5):
    """
    Returns final cosine similarity score per service
    """

    # service -> field -> list[cosine_scores]
    service_scores = defaultdict(lambda: defaultdict(list))

    for field, query_text in QUERY_SCHEMA.items():
        if not query_text.strip():
            continue

        collection = collections[field]

        results = collection.query(
            query_texts=[query_text],
            n_results=top_k,
            include=["distances", "metadatas"]
        )

        distances = results["distances"][0]
        metadatas = results["metadatas"][0]

        for distance, metadata in zip(distances, metadatas):
            service_name = metadata["service"]

            # cosine similarity
            cosine_similarity = 1 - distance

            service_scores[service_name][field].append(cosine_similarity)

    return compute_final_scores(service_scores)

# -------------------------------------------------
# AGGREGATION LOGIC
# -------------------------------------------------
def compute_final_scores(service_scores: Dict):
    final_results = []

    for service, field_map in service_scores.items():
        all_field_scores = []
        field_level_scores = {}

        for field, scores in field_map.items():
            avg_score = sum(scores) / len(scores)
            field_level_scores[field] = round(avg_score, 4)
            all_field_scores.append(avg_score)

        final_score = (
            sum(all_field_scores) / len(all_field_scores)
            if all_field_scores else 0.0
        )

        final_results.append({
            "service": service,
            "final_cosine_similarity": round(final_score * 100, 2),
            "field_scores": field_level_scores
        })

    return sorted(
        final_results,
        key=lambda x: x["final_cosine_similarity"],
        reverse=True
    )


# -------------------------------------------------
# RUN
# -------------------------------------------------
if __name__ == "__main__":
    matches = match_services(top_k=5)

    for match in matches:
        print("\n==============================")
        print(f"Service: {match['service']}")
        print(f"Final Similarity: {match['final_cosine_similarity']}%")
        print("Field Scores:")
        for field, score in match["field_scores"].items():
            print(f"  {field}: {round(score * 100, 2)}%")
