from flask import Flask, jsonify, request
from datetime import timedelta
import psycopg2
import os
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
    create_access_token,
    get_jwt 
)
from flask_bcrypt import Bcrypt
from flask_cors import CORS

# ---------------- APP SETUP ----------------
app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "supersecret123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=60)

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True)
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"])


# ---------------- DATABASE CONNECTION ----------------
def get_db_connection():
    return psycopg2.connect(
        host=f"/cloudsql/{os.getenv('INSTANCE_CONNECTION_NAME')}",
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


# ---------------- ROOT ----------------
@app.route("/")
def home():
    return jsonify({"message": "API Running"})


# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT password, role FROM users WHERE email=%s", (email,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    stored_password = user[0]
    role = user[1]

    if not bcrypt.check_password_hash(stored_password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=email,
        additional_claims={"role": role}
    )

    return jsonify({
        "access_token": access_token,
        "role": role
    }), 200



# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({"message": "All fields required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    cur.execute("""
        INSERT INTO users (full_name, email, password, role)
        VALUES (%s, %s, %s, 'USER')
    """, (full_name, email, hashed_password))

    conn.commit()

    access_token = create_access_token(
        identity=email,
        additional_claims={"role": "USER"}
    )

    cur.close()
    conn.close()

    return jsonify({
        "message": "Registration successful",
        "access_token": access_token,
        "role": "USER"
    }), 201


# ---------------- GET ALL UNITS ----------------
@app.route("/units", methods=["GET"])
def get_units():

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT u.id, u.unit_number, u.bhk_type, u.rent,
               u.status, u.image_url,
               t.name
        FROM units u
        JOIN towers t ON u.tower_id = t.id
        ORDER BY u.id;
    """)

    rows = cur.fetchall()

    units = []
    for row in rows:
        units.append({
            "id": row[0],
            "unit_number": row[1],
            "bhk_type": row[2],
            "rent": float(row[3]) if row[3] else None,
            "status": row[4],
            "image_url": row[5],
            "tower_name": row[6]
        })

    cur.close()
    conn.close()

    return jsonify(units)


# ---------------- UNIT DETAILS ----------------
@app.route("/units/<int:unit_id>", methods=["GET"])
def get_unit_details(unit_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT u.id, u.unit_number, u.bhk_type, u.rent,
               u.status, u.image_url,
               t.name
        FROM units u
        JOIN towers t ON u.tower_id = t.id
        WHERE u.id = %s;
    """, (unit_id,))

    unit = cur.fetchone()

    if not unit:
        cur.close()
        conn.close()
        return jsonify({"error": "Unit not found"}), 404

    cur.execute("""
        SELECT a.name
        FROM unit_amenities ua
        JOIN amenities a ON ua.amenity_id = a.id
        WHERE ua.unit_id = %s;
    """, (unit_id,))

    amenities = [row[0] for row in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({
        "id": unit[0],
        "unit_number": unit[1],
        "bhk_type": unit[2],
        "rent": float(unit[3]),
        "status": unit[4],
        "image_url": unit[5],
        "tower_name": unit[6],
        "amenities": amenities
    })


# ---------------- BOOK UNIT ----------------
@app.route("/book", methods=["POST"])
@jwt_required()
def book_unit():

    data = request.get_json()
    unit_id = data.get("unit_id")
    user_email = get_jwt_identity()

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (user_email,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return jsonify({"message": "User not found"}), 404

    user_id = user[0]

    cur.execute("""
        INSERT INTO bookings (user_id, unit_id, status)
        VALUES (%s, %s, 'PENDING')
    """, (user_id, unit_id))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Booking request submitted successfully"})

# ---------------- SEARCH + FILTER UNITS ----------------
@app.route("/units/search", methods=["GET"])
def search_units():
    q = request.args.get("q", "").strip()
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    status_param = request.args.get("status", "").strip()
    tower = request.args.get("tower", "").strip()

    try:
        page = max(int(request.args.get("page", 1)), 1)
        limit = min(max(int(request.args.get("limit", 12)), 1), 50)
    except ValueError:
        page, limit = 1, 12

    offset = (page - 1) * limit
    conditions = ["1=1"]
    params = []

    if q:
        conditions.append("(u.unit_number ILIKE %s OR u.bhk_type ILIKE %s OR t.name ILIKE %s)")
        like_q = f"%{q}%"
        params.extend([like_q, like_q, like_q])

    if min_price is not None:
        conditions.append("u.rent >= %s")
        params.append(min_price)

    if max_price is not None:
        conditions.append("u.rent <= %s")
        params.append(max_price)

    if status_param:
        statuses = [s.strip().upper() for s in status_param.split(",") if s.strip()]
        if statuses:
            placeholders = ", ".join(["%s"] * len(statuses))
            conditions.append(f"u.status IN ({placeholders})")
            params.extend(statuses)

    if tower:
        conditions.append("t.name ILIKE %s")
        params.append(f"%{tower}%")

    where_clause = " AND ".join(conditions)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(f"SELECT COUNT(*) FROM units u JOIN towers t ON u.tower_id = t.id WHERE {where_clause}", tuple(params))
    total_records = cur.fetchone()[0]
    total_pages = max((total_records + limit - 1) // limit, 1)

    cur.execute(f"""
        SELECT u.id, u.unit_number, u.bhk_type, u.rent, u.status, u.image_url, t.name
        FROM units u JOIN towers t ON u.tower_id = t.id
        WHERE {where_clause}
        ORDER BY u.id
        LIMIT %s OFFSET %s
    """, tuple(params) + (limit, offset))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({
        "page": page, "limit": limit,
        "total_records": total_records, "total_pages": total_pages,
        "count": len(rows),
        "data": [
            {"id": r[0], "unit_number": r[1], "bhk_type": r[2],
             "rent": float(r[3]) if r[3] else None,
             "status": r[4], "image_url": r[5], "tower_name": r[6]}
            for r in rows
        ]
    })


# ---------------- FILTER METADATA ----------------
@app.route("/units/filter-meta", methods=["GET"])
def filter_meta():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT DISTINCT name FROM towers ORDER BY name")
    towers = [r[0] for r in cur.fetchall()]

    cur.execute("SELECT DISTINCT status FROM units ORDER BY status")
    statuses = [r[0] for r in cur.fetchall()]

    cur.execute("SELECT DISTINCT bhk_type FROM units ORDER BY bhk_type")
    bhk_types = [r[0] for r in cur.fetchall()]

    cur.execute("SELECT MIN(rent), MAX(rent) FROM units")
    price_row = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify({
        "towers": towers,
        "statuses": statuses,
        "bhk_types": bhk_types,
        "price_range": {
            "min": float(price_row[0]) if price_row[0] else 0,
            "max": float(price_row[1]) if price_row[1] else 0
        }
    })

# ---------------- UPDATE BOOKING STATUS (Admin) ----------------
@app.route("/admin/bookings/<int:booking_id>", methods=["PUT"])
@jwt_required()
def update_booking(booking_id):
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    status = data.get("status")

    if status not in ["APPROVED", "DECLINED"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE bookings SET status = %s WHERE id = %s",
        (status, booking_id)
    )
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": f"Booking {status.lower()} successfully"})

# ---------------- GET ALL BOOKINGS (Admin) ----------------
@app.route("/admin/bookings", methods=["GET"])
@jwt_required()
def get_all_bookings():
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT b.id, u.full_name, un.unit_number, t.name, b.status, b.request_date
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN units un ON b.unit_id = un.id
        JOIN towers t ON un.tower_id = t.id
        ORDER BY b.request_date DESC
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "data": [
            {
                "booking_id": r[0],
                "user_name": r[1],
                "unit_number": r[2],
                "tower": r[3],
                "status": r[4],
                "request_date": r[5].isoformat()
            }
            for r in rows
        ]
    })

# ---------------- ENTRY POINT ----------------
if __name__ == "__main__":
    app.run()
