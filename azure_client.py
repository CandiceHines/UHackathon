import requests

def send_to_azure(image_path):
    #FOR UPLOADING IMAGE FROM COMPUTER
    url = 'https://aslclassifierhackathon-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/c8c0d0e7-6c14-404e-a0b5-ddec872274f1/classify/iterations/Iteration1/image'
    headers = {
        'Prediction-Key': 'JmJ9xzhQKWlYCoffPQn7dBYgfuxcK3EE5OJAOsYqdsI9Qqqj4qBJJQQJ99BEAC8vTInXJ3w3AAAIACOGqyY6',
        'Content-Type': 'application/octet-stream'
    }

    with open(image_path, 'rb') as img:
        response = requests.post(url, headers=headers, data=img)
        print(response)




    if response.status_code == 200:
        result = response.json()

        predictions = result.get('predictions', [])
        if not predictions:
            return {
                'label': 'No prediction',
                'confidence': 0
            }

        # Find highest-confidence prediction
        best = max(predictions, key=lambda x: x.get('probability', 0))

        return {
            'label': best.get('tagName', 'Unknown'),
            'confidence': round(best.get('probability', 0) * 100, 2)  # as percentage
        }

    else:
        return {
            'label': 'Error',
            'confidence': 0,
            'error': response.text
        }


