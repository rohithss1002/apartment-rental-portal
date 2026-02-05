from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from db import get_db_connection
from extensions import bcrypt


auth_bp = Blueprint("auth", __name__)



# -------------------- LOGIN --------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, password, role FROM users WHERE email = %s",
        (email,)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    user_id, hashed_password, role = user

    if not bcrypt.check_password_hash(hashed_password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user_id),
        additional_claims={"role": role}
    )
    refresh_token = create_refresh_token(identity=str(user_id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": role
    }), 200


# -------------------- REGISTER --------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    cur.execute(
        """
        INSERT INTO users (full_name, email, password, role)
        VALUES (%s, %s, %s, %s)
        """,
        (full_name, email, hashed_password, "USER")
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User registered successfully"}), 201


# -------------------- REFRESH --------------------
@auth_bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT role FROM users WHERE id = %s",
        (int(user_id),)
    )
    role = cur.fetchone()[0]

    cur.close()
    conn.close()

    new_access_token = create_access_token(
        identity=user_id,
        additional_claims={"role": role}
    )

    return jsonify({"access_token": new_access_token}), 200



# -------------------- LOGOUT --------------------
@auth_bp.route("/logout", methods=["POST"])
@jwt_required(refresh=True)
def logout():
    jti = get_jwt()["jti"]
    from app import jwt_blocklist
    jwt_blocklist.add(jti)

    return jsonify({"message": "Logged out successfully"}), 200
