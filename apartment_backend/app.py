from flask import Flask, jsonify, request
from datetime import timedelta

from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt,
    create_access_token
)

from flask_bcrypt import Bcrypt


# ---------------- APP SETUP ----------------
app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "supersecret123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ---------------- FAKE ADMIN USER (DEMO) ----------------
ADMIN_USER = {
    "email": "admin@apartment.com",
    "password": bcrypt.generate_password_hash("admin123").decode("utf-8"),
    "role": "ADMIN"
}

# ---------------- ROOT ----------------
@app.route("/")
def home():
    return jsonify(message="API running (HR demo)")

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email != ADMIN_USER["email"]:
        return jsonify(error="Invalid credentials"), 401

    if not bcrypt.check_password_hash(ADMIN_USER["password"], password):
        return jsonify(error="Invalid credentials"), 401

    access_token = create_access_token(
        identity=email,
        additional_claims={"role": ADMIN_USER["role"]}
    )

    return jsonify(
        access_token=access_token,
        role=ADMIN_USER["role"]
    )

# ---------------- ADMIN DEMO DATA ----------------
@app.route("/admin/overview", methods=["GET"])
@jwt_required()
def admin_overview():
    claims = get_jwt()

    if claims.get("role") != "ADMIN":
        return jsonify(error="Unauthorized"), 403

    return jsonify(
        total_towers=3,
        total_apartments=48,
        occupied=32,
        vacant=16
    )

# ---------------- ENTRY POINT ----------------
if __name__ == "__main__":
    app.run()
