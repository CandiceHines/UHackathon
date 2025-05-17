from flask import Flask, render_template, request, jsonify
from azure_client import send_to_azure
import os
from datetime import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'static/images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
    print("Flask received POST request at /upload-image")
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + "_" + file.filename
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    prediction = send_to_azure(path)
    
    return jsonify({
        'label': prediction['label'],
        'confidence': prediction['confidence'],
        'message': f"Prediction: {prediction['label']} ({prediction['confidence']}% confidence)"
    })

if __name__ == '__main__':
    app.run(debug=True)
