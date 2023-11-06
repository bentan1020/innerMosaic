from flask import Blueprint, request, jsonify
import pymongo
import certifi
import openai
import os
from datetime import datetime

# Initialize MongoDB client
client = pymongo.MongoClient(
    os.environ.get('MONGODB_URI'),
    tlsCAFile=certifi.where(),
)
db = client["journals"]
journal_collection = db["journals"]

journal_bp = Blueprint("journal_bp", __name__)
db = client["journals"]
journal_collection = db["journals"]
chatbot_bp = Blueprint("chatbot_bp", __name__)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key


@journal_bp.route("/api/journal/retrieve-journal", methods=["POST"])
def retrieve_journal():
    if request.method == "POST":
        journal_date = request.json.get("date")
        user_id = request.json.get("uid").split("_")[1]

        print(journal_date)
        print(user_id)

        if not journal_date or not user_id:
            return jsonify({"error": "Missing date or userid"}), 400
        try:
            # Query is now searching for UID in the top level document
            res = journal_collection.find_one({"date": journal_date, "uid": user_id})
            if res:
                res.pop("_id", None)
                # If an entry is found, return it.
                return jsonify(res), 200
            else:
                # If no entry is found, return an error message.
                return jsonify({"error": "No entry found"}), 200
        except Exception as e:
            # Handle any other exceptions and return an error message.
            return jsonify({"error": str(e)}), 500


@journal_bp.route("/api/journal/retrieve-journal-and-ask-ai", methods=["POST"])
def retrieve_journal_and_ask_ai():
    if request.method == "POST":
        journal_date = request.json.get("date")
        user_id = request.json.get("uid").split("_")[1]

        datetime_obj = datetime.fromisoformat(journal_date.rstrip("Z"))

        # Format the datetime object to a date string 'YYYY-MM-DD'
        formatted_date = datetime_obj.strftime("%Y-%m-%d")

        print(journal_date)
        print(user_id)

        your_entry = ""
        if not journal_date or not user_id:
            return jsonify({"error": "Missing date or userid"}), 400
        try:
            # Query is now searching for UID in the top level document
            res = journal_collection.find_one({"date": formatted_date, "uid": user_id})
            if res:
                your_entry = res["journal_entry"]
                res.pop("_id", None)
            else:
                print("nothing found")
                # If no entry is found, return an error message.
                return jsonify({"error": "No entry found"}), 200
        except Exception as e:
            # Handle any other exceptions and return an error message.
            return jsonify({"error": str(e)}), 500

        print(res)
        res_journal = res["journal_entry"]
        res_color = res["color_analysis"]
        print(res)
        conversation_prompt = f"you are a world class psychologist, analyze my emotions from this journal here: '{res_journal}', explain to me why you have given these color analysis to my emotions: '{res_color}"
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
            return (
                jsonify({"error": "Failed to generate a compassionate response"}),
                500,
            )

        return jsonify({"your_entry": your_entry, "response": openai_response})
