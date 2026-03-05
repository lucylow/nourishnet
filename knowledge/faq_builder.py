"""
Small helper script to populate a ChromaDB collection with
Logistics‑agent FAQ entries for Retrieval‑Augmented Generation (RAG).

Run this once (after installing requirements) to create/populate the
`logistics_faq` collection used by `LogisticsAgent`.
"""

from __future__ import annotations

import chromadb
from sentence_transformers import SentenceTransformer


def build_logistics_faq_collection(persist_dir: str = "./chroma_db") -> None:
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    client = chromadb.PersistentClient(path=persist_dir)

    collection = client.get_or_create_collection(
        name="logistics_faq",
        metadata={"hnsw:space": "cosine"},
    )

    faqs = [
        {
            "question": "How do I get my pickup code?",
            "answer": (
                "Your pickup code is sent via WhatsApp or Telegram when a match is made. "
                "You can also reply with the word 'code' to receive it again."
            ),
        },
        {
            "question": "What if I can't pick up the food?",
            "answer": (
                "If you can't pick up the food, please reply 'cancel' as soon as possible "
                "so we can reassign it to someone else."
            ),
        },
        {
            "question": "Where do I pick up the food?",
            "answer": (
                "The pickup location is included in your match message and is usually the "
                "business address. Check the message for the exact location and any notes."
            ),
        },
        {
            "question": "How long is my pickup code valid?",
            "answer": (
                "Pickup codes are typically valid for around 30 minutes after the match is sent. "
                "If you think you will be late, reply to the message so we can help."
            ),
        },
    ]

    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for idx, faq in enumerate(faqs):
        text = f"Q: {faq['question']}\nA: {faq['answer']}"
        emb = embedder.encode(text).tolist()
        ids.append(f"faq_{idx}")
        embeddings.append(emb)
        documents.append(faq["answer"])
        metadatas.append({"question": faq["question"]})

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )


if __name__ == "__main__":
    build_logistics_faq_collection()

