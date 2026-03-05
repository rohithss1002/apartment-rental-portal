from flask import Blueprint, request, jsonify
from db import get_db_connection

units_search_bp = Blueprint("units_search", __name__)


# -------------------- PUBLIC: SEARCH + FILTER UNITS --------------------
# No JWT required — users can browse without logging in
@units_search_bp.route("/units/search", methods=["GET"])
def search_units():
    """
    Query params:
      q           - free-text search on unit_number, bhk_type, tower name
      min_price   - minimum rent
      max_price   - maximum rent
      status      - AVAILABLE | OCCUPIED | MAINTENANCE (comma-separated for multiple)
      tower       - tower name (partial match)
      page        - page number (default 1)
      limit       - results per page (default 12)
    """
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

    # Build dynamic WHERE clause
    conditions = ["1=1"]
    params = []

    if q:
        conditions.append("""
            (
                u.unit_number ILIKE %s
                OR u.bhk_type ILIKE %s
                OR t.name ILIKE %s
            )
        """)
        like_q = f"%{q}%"
        params.extend([like_q, like_q, like_q])

    if min_price is not None:
        conditions.append("u.rent >= %s")
        params.append(min_price)

    if max_price is not None:
        conditions.append("u.rent <= %s")
        params.append(max_price)

    # Support comma-separated statuses e.g. status=AVAILABLE,MAINTENANCE
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

    # Count total matching records
    count_sql = f"""
        SELECT COUNT(*)
        FROM units u
        JOIN towers t ON u.tower_id = t.id
        WHERE {where_clause}
    """
    cur.execute(count_sql, tuple(params))
    total_records = cur.fetchone()[0]
    total_pages = max((total_records + limit - 1) // limit, 1)

    # Fetch paginated results
    data_sql = f"""
        SELECT
            u.id,
            u.unit_number,
            u.bhk_type,
            u.rent,
            u.status,
            u.image_url,
            t.name AS tower_name
        FROM units u
        JOIN towers t ON u.tower_id = t.id
        WHERE {where_clause}
        ORDER BY u.id
        LIMIT %s OFFSET %s
    """
    cur.execute(data_sql, tuple(params) + (limit, offset))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    units = [
        {
            "id": r[0],
            "unit_number": r[1],
            "bhk_type": r[2],
            "rent": float(r[3]) if r[3] else None,
            "status": r[4],
            "image_url": r[5],
            "tower_name": r[6],
        }
        for r in rows
    ]

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": total_pages,
        "count": len(units),
        "data": units
    })


# -------------------- PUBLIC: FILTER METADATA --------------------
# Returns dynamic filter options (no hardcoded values)
@units_search_bp.route("/units/filter-meta", methods=["GET"])
def filter_meta():
    """
    Returns available towers, statuses, price range, and BHK types
    so the frontend can build filter dropdowns dynamically.
    """
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
    price_range = {
        "min": float(price_row[0]) if price_row[0] else 0,
        "max": float(price_row[1]) if price_row[1] else 0
    }

    cur.close()
    conn.close()

    return jsonify({
        "towers": towers,
        "statuses": statuses,
        "bhk_types": bhk_types,
        "price_range": price_range
    })