from __future__ import annotations

from typing import List

try:
    import chromadb
    from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover - optional dependency guard
    chromadb = None
    SentenceTransformer = None  # type: ignore[assignment]


class RAGEngine:
    """
    Small retrieval-augmented generation helper.

    This is intentionally minimal and defensive:
    - If Chroma/SentenceTransformers are not installed, it becomes a no-op
      that always returns an empty retrieval result.
    - Collections are created on demand so you can run a separate builder
      script to populate them.
    """

    def __init__(self, collection_name: str, persist_dir: str = "./chroma_db") -> None:
        self.collection_name = collection_name
        self.persist_dir = persist_dir

        # If dependencies are missing, mark as disabled and short‑circuit later.
        if chromadb is None or SentenceTransformer is None:
            self.enabled = False
            self.client = None
            self.collection = None
            self.embedder = None
            return

        self.enabled = True
        self.client = chromadb.PersistentClient(path=persist_dir)  # type: ignore[call-arg]
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

    def retrieve(self, query: str, n_results: int = 3) -> List[str]:
        """Retrieve top‑n relevant documents as plain text strings."""
        if not self.enabled or not self.collection or not self.embedder:
            return []

        if not query.strip():
            return []

        query_emb = self.embedder.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_emb,
            n_results=n_results,
            include=["documents"],
        )
        # `documents` is a list of lists: one inner list per query.
        documents = results.get("documents") or []
        return documents[0] if documents else []

    def augment_prompt(self, query: str, retrieved_docs: List[str]) -> str:
        """Build an instruction prompt that includes retrieved context."""
        context = "\n\n".join(retrieved_docs)
        return (
            "You are a helpful assistant for a food rescue service. "
            "Use the following information to answer the user's question. "
            "If the answer is not in the context, say you don't know.\n\n"
            f"Context:\n{context}\n\n"
            f"User question: {query}\n\n"
            "Answer:"
        )

