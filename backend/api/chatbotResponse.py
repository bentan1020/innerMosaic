from flask import Blueprint, request, jsonify, current_app
import openai
from collections import Counter
import os
import pymongo
from bson import ObjectId
import certifi
import ssl
from dotenv import load_dotenv
import re

load_dotenv()

client = pymongo.MongoClient(
    os.environ.get('MONGODB_URI'),
    tlsCAFile=certifi.where(),
)
db = client["journals"]
journal_collection = db["journals"]
chatbot_bp = Blueprint("chatbot_bp", __name__)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

@chatbot_bp.route("/api/chatbot/therapist", methods=["POST"])
def therapistTalks():
    data = request.json
    statement = data["text"]

    conversation_prompt = f"Act as my personal therapist, you are a world class therapist, how would you respond if someone tells you the following? Asking a question is ideal. Remember, you are a WORLD class therapist, this is what you client said to you: '{statement}, you are a world class therapist'"
    try:
        openai_response = (
            openai.Completion.create(
                model="text-davinci-003",
                prompt=conversation_prompt,
                max_tokens=150,
                temperature=0.9,
            )
            .choices[0]
            .text.strip()
        )
    except Exception as e:
        current_app.logger.error(f"OpenAI API call failed: {e}")
        return jsonify({"error": "Failed to generate a compassionate response"}), 500
    
    return jsonify({"response": openai_response})
