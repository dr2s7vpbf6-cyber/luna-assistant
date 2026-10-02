from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Luna's companion modes
LUNA_MODES = {
    "outfit": "👗 Outfit & Style",
    "shopping": "🛍️ Shopping & Sales",
    "fitness": "💪 Fitness & Gesundheit",
    "career": "💼 Karriere & Networking",
    "mindfulness": "🧘 Mindfulness & Selbstliebe",
    "education": "📚 Bildung & Wissen",
    "relationships": "👥 Beziehungen & Community",
    "finance": "💰 Finanzen & Sparen",
    "productivity": "📅 Alltag & Produktivität"
}

# Mock database for users and their selected modes
user_profiles = {}

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "Luna is online ✨"})

@app.route("/api/modes", methods=["GET"])
def get_modes():
    """Get all available companion modes"""
    return jsonify({
        "modes": [
            {"id": k, "name": v} 
            for k, v in LUNA_MODES.items()
        ]
    })

@app.route("/api/user/profile", methods=["POST"])
def create_user_profile():
    """Create a new user profile with selected modes"""
    data = request.json
    user_id = data.get("user_id")
    selected_modes = data.get("modes", [])
    name = data.get("name", "Friend")
    
    user_profiles[user_id] = {
        "name": name,
        "selected_modes": selected_modes,
        "created_at": datetime.now().isoformat(),
        "preferences": {}
    }
    
    return jsonify({
        "success": True,
        "message": f"Hallo {name}! Luna ist bereit, dich zu begleiten! 🌙",
        "profile": user_profiles[user_id]
    }), 201

@app.route("/api/user/<user_id>/profile", methods=["GET"])
def get_user_profile(user_id):
    """Get user profile and their selected modes"""
    if user_id not in user_profiles:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user_profiles[user_id])

@app.route("/api/user/<user_id>/modes", methods=["PUT"])
def update_user_modes(user_id):
    """Update selected companion modes for a user"""
    if user_id not in user_profiles:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    new_modes = data.get("modes", [])
    user_profiles[user_id]["selected_modes"] = new_modes
    
    return jsonify({
        "success": True,
        "message": "Deine Begleitungs-Modi wurden aktualisiert!",
        "selected_modes": new_modes
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    """Chat with Luna"""
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message")
    mode = data.get("mode")  # which mode is the user using
    
    if user_id not in user_profiles:
        return jsonify({"error": "User not found"}), 404
    
    user = user_profiles[user_id]
    
    # Check if mode is in user's selected modes
    if mode not in user["selected_modes"]:
        return jsonify({
            "error": f"Du hast den Modus '{mode}' nicht aktiviert.",
            "hint": "Wähle zuerst deine Begleitungs-Modi in den Einstellungen."
        }), 400
    
    # Generate response based on mode (mock AI response for now)
    response = generate_luna_response(user, message, mode)
    
    return jsonify({
        "user_name": user["name"],
        "mode": LUNA_MODES.get(mode, mode),
        "response": response,
        "timestamp": datetime.now().isoformat()
    })

def generate_luna_response(user, message, mode):
    """Generate Luna's response based on mode"""
    mode_responses = {
        "outfit": f"Ich helfe dir gerne mit Outfit-Tipps! Was für einen Anlass brauchst du? {message}",
        "shopping": f"Lust auf Shopping? Lass mich die besten Deals für dich finden! 🛍️ Wonach suchst du?",
        "fitness": f"Let's go! 💪 Ich helfe dir mit deinem Trainingsplan. Was interessiert dich?",
        "career": f"Deine Karriere ist wichtig! 💼 Lass mich dir helfen. Was beschäftigt dich?",
        "mindfulness": f"Lass uns dich selbst verwöhnen. 🧘 Wie fühlt es sich gerade an?",
        "education": f"Bildung ist Macht! 📚 Was möchtest du lernen?",
        "relationships": f"Beziehungen sind wichtig. 👥 Ich bin für dich da. Erzähl mir mehr.",
        "finance": f"Finanzen meistern! 💰 Lass mich dir helfen. Was willst du wissen?",
        "productivity": f"Lass uns produktiv sein! 📅 Wie kann ich dir helfen?"
    }
    
    return mode_responses.get(mode, f"Ich höre dir zu... {message}")

@app.route("/api/notifications", methods=["POST"])
def create_notification():
    """Create a notification for a user"""
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message")
    mode = data.get("mode")
    
    # In a real app, this would send a notification (email, push, SMS, etc.)
    return jsonify({
        "success": True,
        "notification": {
            "user_id": user_id,
            "message": message,
            "mode": mode,
            "sent_at": datetime.now().isoformat()
        }
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
