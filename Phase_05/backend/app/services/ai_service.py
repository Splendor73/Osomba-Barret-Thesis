import json
import boto3
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.support import FAQ, ForumTopic

def get_bedrock_client():
    """Initializes and returns the AWS Bedrock Runtime client."""
    return boto3.client(
        'bedrock-runtime',
        region_name=settings.aws_region if hasattr(settings, 'aws_region') else 'us-east-1'
    )

def generate_embedding(text_input: str) -> list[float]:
    """
    Generates a 384-dimensional vector embedding for the given text using AWS Bedrock.
    Model: amazon.titan-embed-text-v2:0 (or similar Titan embedding model)
    """
    client = get_bedrock_client()
    
    # AWS Bedrock Titan Embeddings v2 Request Body
    # Depending on the exact model id configured, it typically looks like this:
    body = json.dumps({
        "inputText": text_input
    })

    try:
        response = client.invoke_model(
            body=body,
            modelId=settings.embedding_model,  # e.g., "amazon.titan-embed-text-v2:0"
            accept="application/json",
            contentType="application/json"
        )
        response_body = json.loads(response.get('body').read())
        # Titan models usually return the vector in 'embedding' key
        embedding = response_body.get('embedding')
        if not embedding:
            raise ValueError("No embedding found in the response from Bedrock.")
        
        # Enforce exact 384-dimension vector for pgvector schema compatibility
        if len(embedding) > 384:
            embedding = embedding[:384]
        elif len(embedding) < 384:
            embedding = embedding + [0.0] * (384 - len(embedding))
            
        return embedding
    except Exception as e:
        print(f"Failed to generate embedding via AWS Bedrock: {e}")
        # Return a fallback/dummy zero vector for graceful failure during local dev
        # if AWS credentials aren't fully configured
        return [0.0] * 384

def search_similar_content(db: Session, query_vector: list[float], limit: int = 5, similarity_threshold: float = 0.6):
    """
    Searches FAQs and ForumTopics for content embeddings most similar to the query vector.
    Uses ORM-based pgvector cosine distance queries.
    """
    max_distance = 1.0 - similarity_threshold

    # Search FAQs
    faq_results = (
        db.query(FAQ, FAQ.embedding.cosine_distance(query_vector).label("distance"))
        .filter(FAQ.embedding.isnot(None))
        .filter(FAQ.embedding.cosine_distance(query_vector) < max_distance)
        .order_by(FAQ.embedding.cosine_distance(query_vector))
        .limit(limit)
        .all()
    )

    # Search ForumTopics
    topic_results = (
        db.query(ForumTopic, ForumTopic.embedding.cosine_distance(query_vector).label("distance"))
        .filter(ForumTopic.embedding.isnot(None))
        .filter(ForumTopic.embedding.cosine_distance(query_vector) < max_distance)
        .order_by(ForumTopic.embedding.cosine_distance(query_vector))
        .limit(limit)
        .all()
    )

    # Combine into unified format expected by ai.py endpoint
    results = []
    for faq, distance in faq_results:
        results.append({
            "source_type": "faq",
            "source_id": faq.id,
            "similarity": 1 - distance
        })
    for topic, distance in topic_results:
        results.append({
            "source_type": "forum",
            "source_id": topic.id,
            "similarity": 1 - distance
        })

    # Sort by similarity descending and limit
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:limit]
