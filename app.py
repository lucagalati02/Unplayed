from flask import Flask, jsonify, request
from database import execute_query, execute_post
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import jwt
from jwt import algorithms
from jwt import PyJWKClient
import time
import requests

app = Flask(__name__)
app.debug = True # Comment out this line for production
CORS(app)

@app.route('/')
def hello_unplayed():
    return jsonify({'message': 'Hello, Unplayed!'})

# ------------------------------------------------------------------------------------------------------------------------------
# -------------------------------------------------------UTILITIES--------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------
def decode_apple_id_token(id_token, client_id):
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
        audience=client_id,
        issuer="https://appleid.apple.com",
    )
    return decoded_id_token

def add_user(EMAIL, ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN, TOKEN_TYPE, EXPIRY):
    if user_exists(EMAIL):
        try:
            # Update the user's auth data in the APPLE_AUTH table
            EXPIRY = datetime.now(timezone.utc) + timedelta(seconds=EXPIRY - 100)
            query = """
                UPDATE "public"."APPLE_AUTH"
                SET "ACCESS_TOKEN" = %s, "ID_TOKEN" = %s, "REFRESH_TOKEN" = %s, "TOKEN_TYPE" = %s, "EXPIRY" = %s
                WHERE "EMAIL" = %s
            """
            params = (ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN, TOKEN_TYPE, EXPIRY, EMAIL)
            execute_post(query, params)
        except Exception as e:
            print("DB ERROR: ", e)
            return jsonify({'DB ERROR': str(e)}), 400
    else:
        try:
            # Step 1: Add the user to the USER table
            query = """
                INSERT INTO "public"."USER" ("EMAIL") VALUES (%s)
            """
            params = (EMAIL,)
            execute_post(query, params)

            # Step 2: Add the user's auth data into the APPLE_AUTH table

            # Create the timestamp for expiry
            EXPIRY = datetime.now(timezone.utc) + timedelta(seconds=EXPIRY - 100)

            query = """
                INSERT INTO "public"."APPLE_AUTH" ("EMAIL", "ACCESS_TOKEN", "ID_TOKEN", "REFRESH_TOKEN", "TOKEN_TYPE", "EXPIRY")
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = (EMAIL, ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN, TOKEN_TYPE, EXPIRY)
            execute_post(query, params)

        except Exception as e:
            print("DB ERROR: ", e)
            return jsonify({'DB ERROR': str(e)}), 400
    
def user_exists(EMAIL):
    query = """
        SELECT * FROM "public"."USER" WHERE "EMAIL" = %s
    """
    params = (EMAIL,)
    result = execute_query(query, params)
    if result:
        return True
    else:
        return False
    
def check_auth(EMAIL):
    query = """
        SELECT "EXPIRY" FROM "public"."APPLE_AUTH" WHERE "EMAIL" = %s
    """
    params = (EMAIL,)
    result = execute_query(query, params)

    if result:
        expiry = result[0]["EXPIRY"]
        if expiry < datetime.now(timezone.utc):
            get_new_auth(EMAIL)
        else:
            return jsonify({'message': 'Access token', 'status': 'valid'})
    else:
        return jsonify({'error': 'User not found in the database'}), 404
    
def get_new_auth(EMAIL):
    try:
        # Fetch the refresh token
        query = """
            SELECT "REFRESH_TOKEN" FROM "public"."APPLE_AUTH" WHERE "EMAIL" = %s
        """
        params = (EMAIL,)
        result = execute_query(query, params)

        if result:
            REFRESH_TOKEN = result[0]["REFRESH_TOKEN"]
            token_url = "https://appleid.apple.com/auth/token"
            client_id = "com.unplayed.unplayed-sid"
            team_id = "6S69WW85R3"
            key_id = "7593B8ND6A"
            PRIVATE_KEY_PATH = 'server/priv_key.p8'

            # Load the private key from the .p8 file
            with open(PRIVATE_KEY_PATH, "r") as key_file:
                private_key = key_file.read()
            
            # Generating JWT client secret
            client_secret = jwt.encode(
                {
                    'iss': team_id,
                    'iat': time.time(),
                    'exp': time.time() + 15777000,
                    'aud': 'https://appleid.apple.com',
                    'sub': client_id,
                },
                private_key,
                algorithm='ES256',
                headers={'kid': key_id},
            )

            payload = {
                "grant_type": "refresh_token",
                "refresh_token": REFRESH_TOKEN,
                "client_id": client_id,
                "client_secret": client_secret,
            }

            response = requests.post(token_url, data=payload)
            if response.status_code != 200:
                return jsonify({'error': 'Failed to refresh token', 'details': response.text}), 400
            
            # Parse the new token data
            token_data = response.json()
            ACCESS_TOKEN = token_data.get('access_token')
            REFRESH_TOKEN = token_data.get('refresh_token', REFRESH_TOKEN)
            EXPIRY = token_data.get('expires_in')

            EXPIRY = datetime.now(timezone.utc) + timedelta(seconds=EXPIRY - 100)

            # Update the user's auth data in the APPLE_AUTH table
            update_query = """
                UPDATE "public"."APPLE_AUTH"
                SET "ACCESS_TOKEN" = %s, "REFRESH_TOKEN" = %s, "EXPIRY" = %s
                WHERE "EMAIL" = %s
            """
            update_params = (ACCESS_TOKEN, REFRESH_TOKEN, EXPIRY, EMAIL)
            execute_post(update_query, update_params)
        else:
            return jsonify({'error': 'User not found in the database'}), 404
    except Exception as e:
        print("DB ERROR: ", e)
        return jsonify({'DB ERROR': str(e)}), 400

@app.route('/apple-callback', methods=['POST'])
def apple_callback():
    data = request.json
    auth_code = data.get('code')

    if not auth_code:
        return jsonify({'error': 'Authorization code is required'}), 400
    
    token_url = "https://appleid.apple.com/auth/token"
    client_id = "com.unplayed.unplayed-sid"
    team_id = "6S69WW85R3"
    key_id = "7593B8ND6A"
    PRIVATE_KEY_PATH = 'server/priv_key.p8'

    # Load the private key from the .p8 file
    with open(PRIVATE_KEY_PATH, "r") as key_file:
        private_key = key_file.read()
    
    # Generating JWT client secret
    client_secret = jwt.encode(
        {
            'iss': team_id,
            'iat': time.time(),
            'exp': time.time() + 15777000,
            'aud': 'https://appleid.apple.com',
            'sub': client_id,
        },
        private_key,
        algorithm='ES256',
        headers={'kid': key_id},
    )

    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': auth_code,
        'grant_type': 'authorization_code',
    }

    # Requesting access token
    response = requests.post(token_url, data=payload)
    token_data = response.json()

    if 'error' in token_data:
        return jsonify({'error': token_data['error']}), 400
    
    ACCESS_TOKEN = token_data.get('access_token')
    EXPIRY = token_data.get('expires_in')
    ID_TOKEN = token_data.get('id_token')
    REFRESH_TOKEN = token_data.get('refresh_token')
    TOKEN_TYPE = token_data.get('token_type')

    # Verifying the ID token and acquiring user data
    decoded_id_token = decode_apple_id_token(ID_TOKEN, client_id)

    USER_EMAIL = decoded_id_token.get('email')
    USER_VERIFIED = decoded_id_token.get('email_verified')

    add_user(USER_EMAIL, ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN, TOKEN_TYPE, EXPIRY)

    return jsonify({
        'email': USER_EMAIL,
        'verified': USER_VERIFIED,
    })

if __name__ == '__main__':
    app.run(debug=True)