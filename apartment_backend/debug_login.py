from flask_bcrypt import Bcrypt
from flask import Flask
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

# Get the admin user's hashed password from DB
conn = get_db_connection()
cur = conn.cursor()

cur.execute(
    "SELECT id, password, role FROM users WHERE email = %s",
    ("admin@apartment.com",)
)
user = cur.fetchone()
cur.close()
conn.close()

if not user:
    print("ERROR: admin@apartment.com not found in database")
else:
    user_id, hashed_password, role = user
    print(f"User ID: {user_id}")
    print(f"Role: {role}")
    print(f"Hashed Password Type: {type(hashed_password)}")
    print(f"Hashed Password: {hashed_password}")
    print()
    
    # Test bcrypt check
    test_password = "admin123"
    result = bcrypt.check_password_hash(hashed_password, test_password)
    print(f"Password 'admin123' matches: {result}")
    
    if not result:
        print("\nPassword check failed. Possible issues:")
        print("1. Hash is corrupted or malformed")
        print("2. Hash was created with a different bcrypt version")
        print("\nLet's re-hash the password and update the database:")
        
        new_hash = bcrypt.generate_password_hash(test_password).decode("utf-8")
        print(f"New hash: {new_hash}")
        print(f"\nTo fix this, run:")
        print(f'UPDATE users SET password = \'{new_hash}\' WHERE email = \'admin@apartment.com\';')
