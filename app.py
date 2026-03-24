from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api

# --------------------------
# Configure Cloudinary - USING CORRECT CREDENTIALS
# --------------------------
cloudinary.config(
    cloud_name="aishcloud",  # Correct cloud name (lowercase)
    api_key="519394657282751",  # Root API Key
    api_secret="Vs-9mwPYKGsgBP7PuJc85QISlLU",  # Root API Secret
    secure=True
)

# --------------------------
# Flask setup
# --------------------------
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

DATA_FILE = 'gallery_data.json'
DEFAULT_DATA = {
    "vertical": [],
    "thai": [],
    "aluminum": [],
    "kai": []
}

# --------------------------
# Load & Save Data
# --------------------------
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_DATA, f, indent=2)
    return DEFAULT_DATA

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

# --------------------------
# API Routes
# --------------------------
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    return jsonify(load_data())

@app.route('/api/gallery/<category>', methods=['POST'])
def add_product(category):
    data = load_data()
    if category not in data:
        return jsonify({"error": "Invalid category"}), 400
    product = request.json
    product['id'] = int(datetime.now().timestamp() * 1000)
    data[category].append(product)
    save_data(data)
    return jsonify(product), 201

@app.route('/api/gallery/<category>/<int:pid>', methods=['DELETE'])
def delete_product(category, pid):
    data = load_data()
    if category in data:
        data[category] = [p for p in data[category] if p['id'] != pid]
        save_data(data)
    return jsonify({"success": True})

# --------------------------
# Upload image to Cloudinary
# --------------------------
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Upload to Cloudinary
    try:
        result = cloudinary.uploader.upload(file)
        url = result['secure_url']
        return jsonify({"url": url})
    except Exception as e:
        print("Cloudinary upload error:", e)
        return jsonify({"error": str(e)}), 500

# --------------------------
# Run server
# --------------------------
if __name__ == '__main__':
    print("=== Aisha Fashion Blind Server Starting ===")
    print(f"Cloudinary configured with cloud_name: aishcloud")
    print("Open http://127.0.0.1:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)