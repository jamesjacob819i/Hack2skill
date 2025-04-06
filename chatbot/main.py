import json
import os

import google.generativeai as genai
from flask import Flask, jsonify, request, send_file, send_from_directory
from dotenv import load_dotenv
import logging
import time
import sys
import re

# Setup logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s", stream=sys.stdout)
logger = logging.getLogger(__name__)

# Load API keys from .env file
load_dotenv()
WELLWISHER_API_KEY = os.getenv('WELLWISHER_API_KEY')
STORIES_API_KEY = os.getenv('STORIES_API_KEY')

if not WELLWISHER_API_KEY or not re.match(r'^AI[a-zA-Z0-9_-]{30,}$', WELLWISHER_API_KEY):
    logger.error("Invalid or missing WELLWISHER_API_KEY in .env file")
    raise ValueError("Invalid or missing WELLWISHER_API_KEY")

if not STORIES_API_KEY or not re.match(r'^AI[a-zA-Z0-9_-]{30,}$', STORIES_API_KEY):
    logger.error("Invalid or missing STORIES_API_KEY in .env file")
    raise ValueError("Invalid or missing STORIES_API_KEY")

# Configure the default API key for the Well Wisher chatbot
genai.configure(api_key=WELLWISHER_API_KEY)

# Initialize model for the Well Wisher chatbot
def initialize_model():
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')
        if model.generate_content("Test").text:
            logger.info("Well Wisher model initialized successfully.")
            return model
    except Exception as e:
        logger.error(f"Model initialization failed: {str(e)}")
        return None

model = initialize_model()

# Use absolute path for static folders to avoid path resolution issues
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
public_dir = os.path.join(parent_dir, 'public')

# Create Flask app with multiple static folders
app = Flask(__name__)

# Register the root directory as a static folder for main.js and other root files
app.static_folder = parent_dir
app.static_url_path = ''

# Add CORS support to allow requests from the frontend
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

@app.route("/")
def index():
    index_path = os.path.join(parent_dir, 'index.html')
    return send_file(index_path)

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
    return "general"

def get_category_prompt(category, input_text):
    prompts = {
        "career": f"As a career advisor for women, give concise career guidance on: {input_text}",
        "mental_health": f"As a mental health advocate for women, provide brief mental health guidance on: {input_text}",
        "abuse": f"As a women's safety advocate, provide safety advice and helpline contacts for: {input_text}",
        "general": f"As a well-wisher for women, provide supportive guidance on: {input_text}",
    }
    return prompts.get(category)

def generate_response(user_input, retries=3):
    category = classify_prompt(user_input)

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

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message", "")
    if not user_input:
        return jsonify({"error": "Message is required"}), 400
    return jsonify({"response": generate_response(user_input)})

@app.route("/api/generate", methods=["POST"])
def generate_api():
    if request.method == "POST":
        try:
            # For stories, we need to reconfigure the API with the stories key
            stories_key_config = genai.configure(api_key=STORIES_API_KEY)
            
            req_body = request.get_json()
            content = req_body.get("contents")

            # Default to inspiring stories if no prompt provided
            if not content:
                content = [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": "Tell an inspiring story about a woman who overcomes challenges and succeeds in her career."
                            }
                        ]
                    }
                ]

            model_name = req_body.get("model", "gemini-2.0-flash-thinking-exp-01-21")
            model = genai.GenerativeModel(model_name=model_name)
            response = model.generate_content(content, stream=True)
            
            # Restore the original API key for Well Wisher after generating the story
            genai.configure(api_key=WELLWISHER_API_KEY)

            # Stream the response back to the client
            def stream():
                for chunk in response:
                    yield 'data: %s\n\n' % json.dumps({"text": chunk.text})

            return stream(), {'Content-Type': 'text/event-stream'}

        except Exception as e:
            # Make sure we restore the Well Wisher API key even if an error occurs
            genai.configure(api_key=WELLWISHER_API_KEY)
            logger.error(f"Error in generate_api: {str(e)}")
            return jsonify({"error": str(e)})

@app.route('/<path:path>')
def serve_static(path):
    # First try to serve from public directory
    public_file_path = os.path.join(public_dir, path)
    if os.path.exists(public_file_path) and os.path.isfile(public_file_path):
        return send_from_directory(public_dir, path)
    
    # If not found in public, try to serve from parent directory (root)
    root_file_path = os.path.join(parent_dir, path)
    if os.path.exists(root_file_path) and os.path.isfile(root_file_path):
        return send_from_directory(parent_dir, path)
    
    # If not found in either location, return 404
    return "File not found", 404

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(debug=True, port=int(os.environ.get('PORT', 5000)))