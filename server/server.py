from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.debug = True # Comment out this line for production
CORS(app)

# Apple Info
load_dotenv()
TEAM_ID = os.getenv('TEAM_ID')
KEY_ID = os.getenv('KEY_ID')
PRIVATE_KEY_PATH = os.getenv('PRIVATE_KEY_PATH')

@app.route('/')
def hello_unplayed():
    return jsonify({'message': 'Hello, Unplayed!'})

@app.route('/get_developer_token', methods=['GET', 'POST'])
def get_developer_token():
    try:
        with open(PRIVATE_KEY_PATH, 'r') as f:
            private_key = f.read()

        # Set token variables
        headers = {
            'alg': 'ES256',
            'kid': KEY_ID
        }
        payload = {
            'iss': TEAM_ID,
            'iat': int (datetime.now(timezone.utc).timestamp()),
            'exp': int((datetime.now(timezone.utc) + timedelta(days=180)).timestamp())
        }

        # Create the token
        token = jwt.encode(payload, private_key, algorithm='ES256', headers=headers)
        return jsonify({'token': token}), 200
    except Exception as e:
        return jsonify({'Error getting token': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)