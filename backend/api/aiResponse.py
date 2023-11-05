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
    os.getenv("MONGODB_URI"),
    tlsCAFile=certifi.where(),
)
db = client["journals"]
journal_collection = db["journals"]
aiResponse_bp = Blueprint("aiResponse_bp", __name__)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

feelings_to_colors = {
    "sad": "dark blue",
    "happy": "yellow",
    "anger": "dark red",
    "confusion": "grey",
    "envy": "green",
    "calm": "sky blue",
    "fear": "dark purple",
}


@aiResponse_bp.route("/api/aiResponse/process_journal_entry", methods=["POST"])
def process_journal_entry():
    data = request.json
    username = data["uid"].split("_")[1]
    date = data["date"]
    text_to_update = data.get("text")  # Ensure 'text' is provided in the request data

    if not text_to_update:
        return jsonify({"error": "No text provided for the update"}), 400

    new_journal_entry_id = ""
    try:
        res = journal_collection.find_one({"date": date, "uid": username})
        if res:
            # Update the text of the existing journal entry
            update_result = journal_collection.update_one(
                {"_id": res["_id"]}, {"$set": {"journal_entry": text_to_update}}
            )

            # The _id remains the same, so we can just use it from the `res` document
            new_journal_entry_id = res["_id"]
        else:
            new_journal_entry = {
                "journal_entry": data["text"],
                "date": data["date"],
                "uid": username,
            }
            new_journal_entry_id = journal_collection.insert_one(
                new_journal_entry
            ).inserted_id
    except Exception as e:
        current_app.logger.error(f"MongoDB update operation failed: {e}")
        return jsonify({"error": "Database update operation failed"}), 500

    try:
        journal_entry = journal_collection.find_one({"_id": new_journal_entry_id})
    except Exception as e:
        current_app.logger.error(f"MongoDB find_one operation failed: {e}")
        return jsonify({"error": "Database operation failed"}), 500

    if not journal_entry:
        return jsonify({"error": "Journal entry not found"}), 404

    emotions_list = list(feelings_to_colors.keys())
    emotion_prompt = (
        f"Please read the following journal entry and provide an emotional analysis. "
        f"For each of the following emotions: {', '.join(emotions_list)}, "
        f"indicate the percentage they are represented in the text. "
        f"Sum of all percentages should equal 100%:\n\n"
        f"{journal_entry['journal_entry']}"
    )

    try:
        emotion_response = (
            openai.Completion.create(
                model="text-davinci-003", prompt=emotion_prompt, max_tokens=60
            )
            .choices[0]
            .text.strip()
            .lower()
        )
    except Exception as e:
        current_app.logger.error(f"OpenAI API call failed: {e}")
        return jsonify({"error": "Failed to process emotions"}), 500

    emotion_pattern = "|".join(re.escape(emotion) for emotion in emotions_list)
    emotion_regex = re.compile(rf"\b({emotion_pattern})\b: (\d+)%")
    emotion_percentages = {}
    total_percentage = 0

    for match in emotion_regex.finditer(emotion_response):
        emotion = match.group(1)
        percent_value = int(match.group(2))
        emotion_percentages[emotion] = percent_value
        total_percentage += percent_value

    if total_percentage == 0:
        current_app.logger.error(
            "No emotions were matched. Check the emotion_response format and regex."
        )
        return jsonify({"error": "No emotions detected in the text"}), 400
    elif total_percentage != 100:
        current_app.logger.warning(
            f"The total percentage of emotions was {total_percentage}, not 100. Adjusting."
        )
        scale = 100.0 / total_percentage
        emotion_percentages = {
            emotion: round(percentage * scale)
            for emotion, percentage in emotion_percentages.items()
        }

    color_percentages = {
        feelings_to_colors[emotion]: percentage
        for emotion, percentage in emotion_percentages.items()
    }

    if not color_percentages:
        current_app.logger.error(
            "No color percentages generated. Check the emotion_percentages processing."
        )
        return jsonify({"error": "Failed to map emotions to colors"}), 400

    conversation_prompt = f"A user writes in their journal: '{journal_entry['journal_entry']}'\n\nAs a compassionate AI, how would you respond to encourage a conversation?"
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

    try:
        journal_collection.update_one(
            {"_id": new_journal_entry_id},
            {
                "$set": {
                    "color_analysis": color_percentages,
                    "ai_response": openai_response,
                }
            },
        )
    except Exception as e:
        current_app.logger.error(f"MongoDB update_one operation failed: {e}")
        return jsonify({"error": "Database update operation failed"}), 500

    if openai_response is None:
        return jsonify({"message": "nothing"}), 200

    return jsonify({"response": openai_response, "colors": color_percentages})
