import json
import boto3
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings

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
    Searches the pgvector database for content embeddings most similar to the query vector.
    """
    # Convert list of floats to string format required by pgvector: '[0.1, 0.2, ...]'
    vector_str = str(query_vector)

    # Use cosine distance (<=>). Similarity = 1 - distance.
    # We want similarity >= threshold, so distance <= (1 - threshold).
    max_distance = 1.0 - similarity_threshold

    sql_query = text("""
        SELECT source_type, source_id, 1 - (embedding <=> :vector) AS similarity
        FROM content_embeddings
        WHERE (embedding <=> :vector) <= :max_distance
        ORDER BY embedding <=> :vector
        LIMIT :limit
    """)

    results = db.execute(sql_query, {
        "vector": vector_str,
        "max_distance": max_distance,
        "limit": limit
    }).mappings().all()

    return results
