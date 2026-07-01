from flask import Blueprint, jsonify, request
from model import get_db
from Backend.Admin.login import token_required

profiles_bp = Blueprint('profiles', __name__)


@profiles_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM profile WHERE id = 1")
            profile = cursor.fetchone()
        return jsonify({"success": True, "data": profile})
    finally:
        conn.close()


@profiles_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json()
    fields = ['name', 'tagline', 'bio', 'email', 'phone', 'location',
              'github_url', 'linkedin_url', 'instagram_url', 'resume_url', 'background_color']

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM profile WHERE id = 1")
            existing = cursor.fetchone()

            if existing:
                set_clause = ', '.join([f"{f} = %s" for f in fields if f in data])
                values = [data[f] for f in fields if f in data]
                if set_clause:
                    cursor.execute(f"UPDATE profile SET {set_clause} WHERE id = 1", values)
            else:
                cursor.execute("""
                    INSERT INTO profile (id, name, tagline, bio, email, phone, location,
                    github_url, linkedin_url, instagram_url, resume_url, background_color)
                    VALUES (1, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [data.get(f, '') for f in fields])

        conn.commit()
        return jsonify({"success": True, "message": "Profil berhasil diperbarui."})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()