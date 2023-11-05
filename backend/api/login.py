from flask import Blueprint, request, jsonify
import pymongo
import certifi
import os

# Initialize MongoDB client
client = pymongo.MongoClient(
    os.getenv("MONGODB_URI"),
    tlsCAFile=certifi.where(),
)
db = client["users"]
user_collection = db["user"]

login_bp = Blueprint("login_bp", __name__)


@login_bp.route("/api/auth/login", methods=["POST"])
def login():
    # Ensure the JSON data is present
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    # Retrieve the user_id from the request data
    data = request.get_json()
    user_id = data.get("userid")
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    fullname = data.get("fullname")
    if not user_id:
        return jsonify({"error": "Missing userid in request"}), 400

    # Remove the prefix 'user_' if present
    if user_id.startswith("user_"):
        user_id = user_id[5:]

    try:
        # Check if the user already exists
        existing_user = user_collection.find_one({"userid": user_id})
        if existing_user:
            # User exists, return a successful response
            return (
                jsonify(
                    {"message": "User already exists", "id": str(existing_user["_id"])}
                ),
                200,
            )
        else:
            # User does not exist, insert a new one
            payload = {
                "userid": user_id,
                "firstname": firstname,
                "lastname": lastname,
                "fullname": fullname,
            }
            insert_result = user_collection.insert_one(payload)
            # Return a response indicating a new user was created
            return (
                jsonify(
                    {
                        "message": "New user created",
                        "id": str(insert_result.inserted_id),
                    }
                ),
                200,
            )
    except pymongo.errors.PyMongoError as e:
        # Handle any errors that occurred during the database operation
        return jsonify({"error": str(e)}), 500
