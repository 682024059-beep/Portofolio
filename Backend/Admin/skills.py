from flask import Blueprint, jsonify, request
from model import get_db
from Backend.Admin.login import token_required

skills_bp = Blueprint('skills', __name__)


@skills_bp.route('/skills', methods=['GET'])
@token_required
def get_skills():
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM skills ORDER BY sort_order, id")
            skills = cursor.fetchall()
        return jsonify({"success": True, "data": skills})
    finally:
        conn.close()


@skills_bp.route('/skills', methods=['POST'])
@token_required
def create_skill():
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "message": "Nama skill wajib diisi."}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO skills (name, category, icon_url, level, sort_order)
                VALUES (%s, %s, %s, %s, %s)
            """, (name, data.get('category', ''), data.get('icon_url', ''),
                  int(data.get('level', 80)), int(data.get('sort_order', 0))))
            new_id = cursor.lastrowid
        conn.commit()
        return jsonify({"success": True, "message": "Skill berhasil ditambahkan.", "id": new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@skills_bp.route('/skills/<int:skill_id>', methods=['PUT'])
@token_required
def update_skill(skill_id):
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE skills SET name=%s, category=%s, icon_url=%s, level=%s, sort_order=%s
                WHERE id=%s
            """, (data.get('name'), data.get('category', ''), data.get('icon_url', ''),
                  int(data.get('level', 80)), int(data.get('sort_order', 0)), skill_id))
        conn.commit()
        return jsonify({"success": True, "message": "Skill berhasil diperbarui."})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@skills_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@token_required
def delete_skill(skill_id):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM skills WHERE id = %s", (skill_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Skill berhasil dihapus."})
    finally:
        conn.close()