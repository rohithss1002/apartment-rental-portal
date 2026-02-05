from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection

user_bp = Blueprint("user", __name__)

@user_bp.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    data = request.get_json()
    user_id = data.get("user_id")
    unit_id = data.get("unit_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT status FROM units WHERE id = %s", (unit_id,))
    unit = cur.fetchone()

    if not unit or unit[0] != "AVAILABLE":
        return jsonify({"error": "Unit not available"}), 400

    cur.execute(
        "INSERT INTO bookings (user_id, unit_id) VALUES (%s, %s)",
        (user_id, unit_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Booking request created"})

@user_bp.route("/bookings/my", methods=["GET"])
@jwt_required()
def get_my_bookings():
    user_id = int(get_jwt_identity())

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    status = request.args.get("status")

    offset = (page - 1) * limit

    conn = get_db_connection()
    cur = conn.cursor()

    base_query = """
        SELECT
            b.id,
            un.unit_number,
            t.name,
            b.status,
            b.request_date
        FROM bookings b
        JOIN units un ON b.unit_id = un.id
        JOIN towers t ON un.tower_id = t.id
        WHERE b.user_id = %s
    """

    params = [user_id]

    if status:
        base_query += " AND b.status = %s"
        params.append(status)

    base_query += """
        ORDER BY b.request_date DESC
        LIMIT %s OFFSET %s
    """
    params.extend([limit, offset])

    cur.execute(base_query, tuple(params))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    bookings = [
        {
            "booking_id": r[0],
            "unit_number": r[1],
            "tower": r[2],
            "status": r[3],
            "request_date": r[4].isoformat()
        }
        for r in rows
    ]

    return jsonify({
        "page": page,
        "limit": limit,
        "count": len(bookings),
        "data": bookings
    })
