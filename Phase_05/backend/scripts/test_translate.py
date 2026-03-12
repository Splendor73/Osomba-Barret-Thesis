import sys
import os
sys.path.append(os.getcwd())

from app.services.ai_service import translate_text

def test_translation():
    text = "How to reset the Password?"
    lang = "fr"
    print(f"Translating: '{text}' to {lang}")
    translated = translate_text(text, lang)
    print(f"Result: '{translated}'")

if __name__ == "__main__":
    test_translation()
