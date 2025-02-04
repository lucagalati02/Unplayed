from flask import Flask, jsonify, request
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

if __name__ == '__main__':
    app.run(debug=True)