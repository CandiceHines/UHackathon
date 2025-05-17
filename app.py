from flask import Flask, request, jsonify

#Here we import the file name of our local model
import our_model_file_name

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['images']
    prediction = our_model_file_name.classify_image(file)
    return jsonify({'result': prediction})

if __name__== '__main__':
    app.run(debug_=True)