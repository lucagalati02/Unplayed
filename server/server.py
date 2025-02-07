from database import execute_query, execute_post
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv
from jwt import PyJWKClient
import time
import requests

app = Flask(__name__)
app.debug = True # Comment out this line for production
CORS(app)

# Initialize server variables
load_dotenv()
TEAM_ID = os.getenv('TEAM_ID')
KEY_ID = os.getenv('KEY_ID')
KEY_ID_SIGN_IN = os.getenv('KEY_ID_SIGN_IN')
PRIVATE_KEY_PATH_USER_TOKEN = os.getenv('PRIVATE_KEY_PATH_USER_TOKEN')
PRIVATE_KEY_PATH_SIGN_IN = os.getenv('PRIVATE_KEY_PATH_SIGN_IN')
DATABASE_URL = os.getenv('DATABASE_URL')
CLIENT_ID = os.getenv('CLIENT_ID')

# Test Route
@app.route('/')
def hello_unplayed():
    return jsonify({'message': 'Hello, Unplayed!'})










# --------------------------------------------------------
# ------------------ Utility Functions -------------------
# --------------------------------------------------------

def decode_apple_id_token(id_token):
    # Fetch Apple's public keys
    jwks_url = "https://appleid.apple.com/auth/keys"
    jwks_client = PyJWKClient(jwks_url)

    # Get signing key
    signing_key = jwks_client.get_signing_key_from_jwt(id_token)

    # Decode the ID token
    decoded_id_token = jwt.decode(
        id_token,
        signing_key.key,  # Use the public key
        algorithms=["RS256"],
        audience=CLIENT_ID,
        issuer="https://appleid.apple.com",
    )
    return decoded_id_token

def user_exists(EMAIL):
    query = """
        SELECT "EMAIL" FROM "public"."USER" WHERE "EMAIL" = %s
    """
    params = (EMAIL,)
    result = execute_query(query, params)
    
    if result:
        return True
    else:
        return False
    
def add_user(EMAIL):
    try:
        query = """
            INSERT INTO "public"."USER" ("EMAIL", "FOLLOWING") VALUES (%s, %s)
        """
        params = (EMAIL, '{"following": []}')
        execute_post(query, params)
    except Exception as e:
        return jsonify({'Error adding user': str(e)}), 500










# --------------------------------------------------------
# ------------------- Utility Routes ---------------------
# --------------------------------------------------------
@app.route('/get_developer_token', methods=['GET', 'POST'])
def get_developer_token():
    try:
        with open(PRIVATE_KEY_PATH_USER_TOKEN, 'r') as f:
            private_key = f.read()

        # Set token variables
        headers = {
            'alg': 'ES256',
            'kid': KEY_ID
        }
        payload = {
            'iss': TEAM_ID,
            'iat': int (datetime.now(timezone.utc).timestamp()),
            'exp': int((datetime.now(timezone.utc) + timedelta(days=10)).timestamp())
        }

        # Create the token
        token = jwt.encode(payload, private_key, algorithm='ES256', headers=headers)
        return jsonify({'token': token}), 200
    except Exception as e:
        return jsonify({'Error getting token': str(e)}), 500
    
@app.route('/apple-callback', methods=['GET', 'POST'])
def apple_callback():
    data = request.json
    auth_code = data.get('code')

    if not auth_code:
        return jsonify({'error': 'Authorization code is required'}), 400
    
    TOKEN_URL = "https://appleid.apple.com/auth/token"
    with open(PRIVATE_KEY_PATH_SIGN_IN, "r") as f:
        private_key = f.read()
    
    # Generating JWT client secret
    client_secret = jwt.encode(
        {
            'iss': TEAM_ID,
            'iat': time.time(),
            'exp': time.time() + 15777000,
            'aud': 'https://appleid.apple.com',
            'sub': CLIENT_ID,
        },
        private_key,
        algorithm='ES256',
        headers={'kid': KEY_ID_SIGN_IN},
    )

    payload = {
        'client_id': CLIENT_ID,
        'client_secret': client_secret,
        'code': auth_code,
        'grant_type': 'authorization_code',
    }

    # Requesting access token
    response = requests.post(TOKEN_URL, data=payload)
    token_data = response.json()

    if 'error' in token_data:
        return jsonify({'error': token_data['error']}), 400

    ID_TOKEN = token_data.get('id_token')

    decoded_id_token = decode_apple_id_token(ID_TOKEN)

    USER_EMAIL = decoded_id_token.get('email')
    USER_VERIFIED = decoded_id_token.get('email_verified')

    if not user_exists(USER_EMAIL):
        add_user(USER_EMAIL)

    return jsonify({
        'email': USER_EMAIL,
        'verified': USER_VERIFIED,
    })










# --------------------------------------------------------
# ---------------- Functionality Routes ------------------
# --------------------------------------------------------
@app.route('/get_user_following', methods=['GET', 'POST'])
def get_user_following():
    query = """
        SELECT "FOLLOWING" FROM "public"."USER" WHERE "EMAIL" = %s
    """
    params = (request.json.get('email'),)
    result = execute_query(query, params)

    return jsonify({'following': result})


if __name__ == '__main__':
    app.run(debug=True)