from flask import Flask
from flask_cors import CORS

from api.aiResponse import aiResponse_bp
from api.login import login_bp
from api.journal import journal_bp
from api.chatbotResponse import chatbot_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(aiResponse_bp)
app.register_blueprint(login_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(journal_bp)

if __name__ == "__main__":
    app.run(debug=True)