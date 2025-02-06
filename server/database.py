import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os
from flask import jsonify

# Load environment variables
load_dotenv()

# Establishing a connection from the server to the PostgreSQL database
def create_connection():
    connection = psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)
    return connection

def execute_query(query, params=None):
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute(query, params)  # Safely include parameters
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        return results  # Return raw results
    except Exception as e:
        print(f"DB Error: {e}")
        return jsonify({"DB Error": str(e)}), 500
    
def execute_post(query, params):
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute(query, params)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Query executed successfully"}), 200
    except Exception as e:
        print("ERRORRRRRRRR: ", e)
        return jsonify({"DB Error": str(e)}), 500