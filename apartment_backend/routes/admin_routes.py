from flask import Blueprint, jsonify, request
from auth.jwt_utils import admin_required
from db import get_db_connection
from utils import bcrypt
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

# -------------------- ADMIN DASHBOARD --------------------
@admin_bp.route("/admin/dashboard/stats", methods=["GET"])
@admin_required()
def admin_dashboard_stats():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM units")
    total_units = cur.fetchone()[0]

    cur.execute("SELECT status, COUNT(*) FROM units GROUP BY status")
    unit_status = dict(cur.fetchall())

    cur.execute("SELECT COUNT(*) FROM bookings")
    total_bookings = cur.fetchone()[0]

    cur.execute("SELECT status, COUNT(*) FROM bookings GROUP BY status")
    booking_status = dict(cur.fetchall())

    cur.execute("""
        SELECT
            b.id,
            u.full_name,
            un.unit_number,
            t.name,
            b.status,
            b.request_date
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN units un ON b.unit_id = un.id
        JOIN towers t ON un.tower_id = t.id
        ORDER BY b.request_date DESC
        LIMIT 5
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()

    recent_bookings = [
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

    return jsonify({
        "users": {"total": total_users},
        "units": {"total": total_units, "by_status": unit_status},
        "bookings": {"total": total_bookings, "by_status": booking_status},
        "recent_bookings": recent_bookings
    })


# -------------------- ADMIN BOOKINGS (PAGINATION + FILTERS) --------------------
@admin_bp.route("/admin/bookings", methods=["GET"])
@admin_required()
def get_all_bookings_paginated():

    # ---------- SAFE PARAM PARSING ----------
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 5))
    except ValueError:
        page = 1
        limit = 5

    page = max(page, 1)
    limit = min(max(limit, 1), 50)
    offset = (page - 1) * limit

    status = request.args.get("status")
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    sort = request.args.get("sort", "desc").lower()
    order = "ASC" if sort == "asc" else "DESC"

    conn = get_db_connection()
    cur = conn.cursor()

    # ---------- COUNT QUERY ----------
    count_query = """
        SELECT COUNT(*)
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN units un ON b.unit_id = un.id
        JOIN towers t ON un.tower_id = t.id
        WHERE 1=1
    """
    count_params = []

    if status:
        count_query += " AND b.status = %s"
        count_params.append(status)

    if from_date:
        count_query += " AND b.request_date >= %s"
        count_params.append(from_date)

    if to_date:
        count_query += " AND b.request_date <= %s"
        count_params.append(to_date)

    cur.execute(count_query, tuple(count_params))
    total_records = cur.fetchone()[0]
    total_pages = (total_records + limit - 1) // limit

    # ---------- DATA QUERY ----------
    data_query = """
        SELECT
            b.id,
            u.full_name,
            un.unit_number,
            t.name,
            b.status,
            b.request_date
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN units un ON b.unit_id = un.id
        JOIN towers t ON un.tower_id = t.id
        WHERE 1=1
    """
    data_params = []

    if status:
        data_query += " AND b.status = %s"
        data_params.append(status)

    if from_date:
        data_query += " AND b.request_date >= %s"
        data_params.append(from_date)

    if to_date:
        data_query += " AND b.request_date <= %s"
        data_params.append(to_date)

    data_query += f"""
        ORDER BY b.request_date {order}
        LIMIT %s OFFSET %s
    """
    data_params.extend([limit, offset])

    cur.execute(data_query, tuple(data_params))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    bookings = [
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
        
    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": total_pages,
        "count": len(bookings),
        "data": bookings
    })


@admin_bp.route("/debug/reset-admin", methods=["POST"])
def reset_admin_password():
    new_hash = bcrypt.generate_password_hash("admin123").decode("utf-8")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE users SET password = %s WHERE email = %s",
        (new_hash, "admin@apartment.com")
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Admin password reset to admin123"}
