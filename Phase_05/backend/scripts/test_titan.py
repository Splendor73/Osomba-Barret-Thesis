import sys
import os
import json
import boto3
sys.path.append(os.getcwd())

def test_titan_translation():
    client = boto3.client('bedrock-runtime', region_name='us-east-1')
    text = "How to reset the Password?"
    lang = "French"
    
    # Titan Text prompt
    prompt = f"User: Translate the following text into {lang}. Only provide the translated text:\n\n{text}\n\nBot:"
    
    body = json.dumps({
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 512,
            "stopSequences": [],
            "temperature": 0,
            "topP": 0.9
        }
    })

    try:
        response = client.invoke_model(
            body=body,
            modelId="amazon.titan-text-express-v1",
            accept="application/json",
            contentType="application/json"
        )
        response_body = json.loads(response.get('body').read())
        print(f"Titan Result: {response_body.get('results')[0].get('outputText')}")
    except Exception as e:
        print(f"Titan failed: {e}")

if __name__ == "__main__":
    test_titan_translation()
