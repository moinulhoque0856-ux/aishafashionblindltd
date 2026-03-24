from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import cloudinary
import cloudinary.uploader

# Get Cloudinary settings from environment variables
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', 'aishcloud'),
    api_key=os.environ.get('CLOUDINARY_API_KEY', '519394657282751'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', 'Vs-9mwPYKGsgBP7PuJc85QISlLU'),
    secure=True
)

app = Flask(__name__)
CORS(app)

DATA_FILE = 'gallery_data.json'
DEFAULT_DATA = {
    "vertical": [],
    "thai": [],
    "aluminum": [],
    "kai": []
}

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    with open(DATA_FILE, 'w') as f:
        json.dump(DEFAULT_DATA, f)
    return DEFAULT_DATA

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def home():
    return jsonify({"message": "Aisha Fashion Blind API is running", "status": "healthy"})

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

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    try:
        result = cloudinary.uploader.upload(file)
        return jsonify({"url": result['secure_url']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
