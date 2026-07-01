from flask import Blueprint, jsonify, request
from model import get_db
from Backend.Admin.login import token_required

experience_bp = Blueprint('experience', __name__)


@experience_bp.route('/experience', methods=['GET'])
@token_required
def get_experience():
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM experience ORDER BY sort_order, id")
            experience = cursor.fetchall()
        return jsonify({"success": True, "data": experience})
    finally:
        conn.close()


@experience_bp.route('/experience', methods=['POST'])
@token_required
def create_experience():
    data = request.get_json()
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    if not title or not company:
        return jsonify({"success": False, "message": "Judul dan perusahaan wajib diisi."}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO experience (title, company, period, description, sort_order)
                VALUES (%s, %s, %s, %s, %s)
            """, (title, company, data.get('period', ''), data.get('description', ''),
                  int(data.get('sort_order', 0))))
            new_id = cursor.lastrowid
        conn.commit()
        return jsonify({"success": True, "message": "Pengalaman berhasil ditambahkan.", "id": new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@experience_bp.route('/experience/<int:exp_id>', methods=['PUT'])
@token_required
def update_experience(exp_id):
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE experience SET title=%s, company=%s, period=%s, description=%s, sort_order=%s
                WHERE id=%s
            """, (data.get('title'), data.get('company'), data.get('period', ''),
                  data.get('description', ''), int(data.get('sort_order', 0)), exp_id))
        conn.commit()
        return jsonify({"success": True, "message": "Pengalaman berhasil diperbarui."})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@experience_bp.route('/experience/<int:exp_id>', methods=['DELETE'])
@token_required
def delete_experience(exp_id):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM experience WHERE id = %s", (exp_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Pengalaman berhasil dihapus."})
    finally:
        conn.close()