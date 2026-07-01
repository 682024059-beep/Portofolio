from flask import Blueprint, jsonify, request
from model import get_db
from Backend.Admin.login import token_required
import cloudinary
import cloudinary.uploader

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('/projects', methods=['GET'])
@token_required
def get_projects():
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM projects ORDER BY sort_order, id")
            projects = cursor.fetchall()
        return jsonify({"success": True, "data": projects})
    finally:
        conn.close()


@projects_bp.route('/projects', methods=['POST'])
@token_required
def create_project():
    data = request.get_json()
    title = data.get('title', '').strip()
    if not title:
        return jsonify({"success": False, "message": "Judul proyek wajib diisi."}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO projects (title, description, image_url, image_public_id, tech_stack, demo_url, code_url, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (title, data.get('description', ''), data.get('image_url', ''),
                  data.get('image_public_id', ''), data.get('tech_stack', ''),
                  data.get('demo_url', ''), data.get('code_url', ''),
                  int(data.get('sort_order', 0))))
            new_id = cursor.lastrowid
        conn.commit()
        return jsonify({"success": True, "message": "Proyek berhasil ditambahkan.", "id": new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route('/projects/<int:proj_id>', methods=['PUT'])
@token_required
def update_project(proj_id):
    data = request.get_json()
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE projects SET title=%s, description=%s, image_url=%s, image_public_id=%s,
                tech_stack=%s, demo_url=%s, code_url=%s, sort_order=%s WHERE id=%s
            """, (data.get('title'), data.get('description', ''), data.get('image_url', ''),
                  data.get('image_public_id', ''), data.get('tech_stack', ''),
                  data.get('demo_url', ''), data.get('code_url', ''),
                  int(data.get('sort_order', 0)), proj_id))
        conn.commit()
        return jsonify({"success": True, "message": "Proyek berhasil diperbarui."})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route('/projects/<int:proj_id>', methods=['DELETE'])
@token_required
def delete_project(proj_id):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT image_public_id FROM projects WHERE id = %s", (proj_id,))
            project = cursor.fetchone()
            if project and project['image_public_id']:
                try:
                    cloudinary.uploader.destroy(project['image_public_id'])
                except Exception as e:
                    print(f"⚠️ Cloudinary delete error: {e}")
            cursor.execute("DELETE FROM projects WHERE id = %s", (proj_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Proyek berhasil dihapus."})
    finally:
        conn.close()