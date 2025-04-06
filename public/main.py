from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import time
import sys
import re

# Setup logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s", stream=sys.stdout)
logger = logging.getLogger(__name__)

# Load API key
load_dotenv()
API_KEY = os.getenv('GOOGLE_API_KEY')
if not API_KEY or not re.match(r'^AI[a-zA-Z0-9_-]{30,}$', API_KEY):
    raise ValueError("Invalid or missing GOOGLE_API_KEY")

# Configure model
def initialize_model():
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')
        if model.generate_content("Test").text:
            logger.info("Model initialized successfully.")
            return model
    except Exception as e:
        logger.error(f"Model initialization failed: {str(e)}")
        return None

model = initialize_model()
app = Flask(__name__, static_folder="web", static_url_path="/")

# Classify prompt and generate category-specific content
def classify_prompt(input_text):
    keywords = {
        "career": ["career", "job", "resume", "interview", "work"],
        "mental_health": ["stress", "depression", "anxiety", "therapy"],
        "abuse": ["abuse", "harassment", "violence", "assault"],
    }
    input_text_lower = input_text.lower()
    for category, words in keywords.items():
        if any(word in input_text_lower for word in words):
            return category
    return "invalid"

def get_category_prompt(category, input_text):
    prompts = {
        "career": f"Career advice: {input_text}",
        "mental_health": f"Mental health guidance: {input_text}",
        "abuse": f"Safety advice and helpline contacts for: {input_text}",
    }
    return prompts.get(category, None)

def generate_response(user_input, retries=3):
    category = classify_prompt(user_input)
    if category == "invalid":
        return "I can assist with career guidance, mental health support, or abuse-related queries."

    for _ in range(retries):
        try:
            if not model:
                raise Exception("Model not initialized.")
            prompt = get_category_prompt(category, user_input)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            time.sleep(1)

    return "I'm having trouble right now. Please try again."

@app.route("/")
def index():
    return send_from_directory("web", "index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message", "")
    if not user_input:
        return jsonify({"error": "Message is required"}), 400
    return jsonify({"response": generate_response(user_input)})

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host="127.0.0.1", port=5000, debug=True)   