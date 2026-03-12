import sys
import os
import json
import boto3
sys.path.append(os.getcwd())

def test_nova_translation():
    client = boto3.client('bedrock-runtime', region_name='us-east-1')
    text = "How to reset the Password?"
    lang = "French"
    
    prompt = f"Translate the following text into {lang}. Only provide the translated text without any preamble or explanation:\n\n{text}"
    
    body = json.dumps({
        "inferenceConfig": {
            "max_new_tokens": 512,
            "temperature": 0
        },
        "messages": [
            {
                "role": "user",
                "content": [
                    {"text": prompt}
                ]
            }
        ]
    })

    try:
        response = client.invoke_model(
            body=body,
            modelId="amazon.nova-micro-v1:0",
            accept="application/json",
            contentType="application/json"
        )
        response_body = json.loads(response.get('body').read())
        print(f"Nova Result: {response_body['output']['message']['content'][0]['text']}")
    except Exception as e:
        print(f"Nova failed: {e}")

if __name__ == "__main__":
    test_nova_translation()
