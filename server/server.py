from database import execute_query, execute_post
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta, timezone, date
import jwt
import os
from dotenv import load_dotenv
from jwt import PyJWKClient
import time
import requests
import json

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
# ------------------- Database Routes --------------------
# --------------------------------------------------------
@app.route('/get_user_following', methods=['GET', 'POST'])
def get_user_following():
    query = """
        SELECT "FOLLOWING" FROM "public"."USER" WHERE "EMAIL" = %s
    """
    params = (request.json.get('email'),)
    result = execute_query(query, params)

    return result[0]

@app.route('/save_selected_artists', methods=['POST'])
def save_selected_artists():
    # Extract the list of selected artists from the request body
    selected_artists = request.json.get('selectedArtists', [])
    email = request.json.get('email')

    # Build the dict in the desired format
    data_to_store = {
        "following": selected_artists
    }

    # Convert that dict to a JSON string
    json_string = json.dumps(data_to_store)

    query = """
        UPDATE "public"."USER"
        SET "FOLLOWING" = %s
        WHERE "EMAIL" = %s
    """
    params = (json_string, email)

    # execute_post is your own function for running SQL updates
    result = execute_post(query, params)

    return jsonify({'result': 'success'})









# --------------------------------------------------------
# ------------------ Apple Music Functions ------------------
# --------------------------------------------------------
def get_user_storefront():
    try:
        headers = request.json.get('params').get('headers')
        url = 'https://api.music.apple.com/v1/me/storefront'

        if not headers:
            return jsonify({'error': 'Authorization headers are required'}), 400
        
        response = requests.get(url, headers=headers).json().get('data')[0].get('id')
        return response
    except Exception as e:
        return jsonify({'error getting user storefront': str(e)}), 400






# --------------------------------------------------------
# ------------------ Apple Music Routes ------------------
# --------------------------------------------------------
@app.route('/get_library_artists', methods=['GET', 'POST'])
def get_library_artists():
    response = []
    base_url = 'https://api.music.apple.com'
    url = f'{base_url}/v1/me/library/artists'
    counter = 0

    try:
        # Get the user's storefront
        storefront = get_user_storefront()

        # Get all artists in the user's library
        headers = request.json.get('params').get('headers')
        if not headers:
            return jsonify({'error': 'Authorization headers are required'}), 400
        artists = requests.get(url, headers=headers).json()
        

        while True:
            for artist in artists.get('data'):
                counter += 1
                temp_artist = {
                    'id': counter,
                    'name': artist.get('attributes').get('name'),
                    'clicked': False
                }
                response.append(temp_artist)

            if artists.get('next'):
                artists = requests.get(f"{base_url}{artists.get('next')}", headers=headers).json()
            else:
                break

        return jsonify({ 'data': response }), 200
    except Exception as e:
        return jsonify({'Error getting library artists': str(e)}), 500
    
@app.route('/generate_unplayed_playlist', methods=['GET', 'POST'])
def generate_unplayed_playlist():
    try:
        headers = request.json.get('params').get('headers')
        # Getting the storefront
        storefront = get_user_storefront()
        start_date = date.fromisoformat(request.json.get('params').get('startDate').split("T")[0])
        end_date = date.fromisoformat(request.json.get('params').get('endDate').split("T")[0])

        # Getting the user's following
        following = request.json.get('params').get('following')
        print('GOT FOLLOWING')

        # Getting following artist ids
        ids = []
        for artist in following:
            url = f'https://api.music.apple.com/v1/catalog/{storefront}/search?types=artists&term={artist}&limit=1'
            response = requests.get(url, headers=headers).json().get('results').get('artists').get('data')[0].get('id')
            ids.append(response)
        print('GOT ARTIST IDS')

        # Creating an empty playlist
        url = 'https://api.music.apple.com/v1/me/library/playlists'
        payload = {
            'attributes': {
                'name': f'Unplayed',
            }
        }
        response = requests.post(url, headers=headers, json=payload).json()
        playlist_id = response.get('data')[0].get('id')
        print('CREATED PLAYLIST')

        # Getting every song
        songs = []
        for artist in ids:
            url = f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{artist}/songs?limit={20}"
            while url:
                response = requests.get(url, headers=headers).json()
                for song in response.get('data'):
                    release_date = song.get('attributes', {}).get('releaseDate')
                    if not isinstance(release_date, str):
                        continue
                    try:
                        release_date = date.fromisoformat(release_date)
                    except ValueError:
                        continue
                    if start_date <= release_date <= end_date:
                        songs.append(song.get('id'))
                url = f"https://api.music.apple.com{response.get('next')}" if response.get('next') else None
        print('GOT SONGS')

        # Adding songs to the playlist
        url = f"https://api.music.apple.com/v1/me/library/playlists/{playlist_id}/tracks"
        for batch in range(0, len(songs), 150):
            chunk = songs[batch : batch + 150]
            payload = {
                'data': [
                    {
                        'id': song,
                        'type': 'songs'
                    } for song in chunk
                ]
            }

            response = requests.post(url, headers=headers, json = payload)
        print('ADDED SONGS TO PLAYLIST')
        
        return jsonify({'test': 'success'}), 200
    except Exception as e:
        return jsonify({'Error generating unplayed playlist': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)