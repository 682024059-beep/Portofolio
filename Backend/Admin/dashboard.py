from flask import Blueprint, jsonify
from model import get_db
from Backend.Admin.login import token_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard():
    """Get dashboard stats."""
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as total FROM skills")
            skills_count = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as total FROM experience")
            exp_count = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as total FROM projects")
            proj_count = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as total FROM messages")
            msg_count = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) as total FROM messages WHERE is_read = FALSE")
            unread_count = cursor.fetchone()['total']

            # Recent messages
            cursor.execute("""
                SELECT id, sender_name, sender_email, subject, is_read, created_at
                FROM messages ORDER BY created_at DESC LIMIT 5
            """)
            recent_messages = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": {
                "stats": {
                    "skills": skills_count,
                    "experience": exp_count,
                    "projects": proj_count,
                    "messages": msg_count,
                    "unread_messages": unread_count
                },
                "recent_messages": recent_messages
            }
        })
    finally:
        conn.close()


@dashboard_bp.route('/messages', methods=['GET'])
@token_required
def get_messages():
    """Get all messages."""
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM messages ORDER BY created_at DESC")
            messages = cursor.fetchall()
        return jsonify({"success": True, "data": messages})
    finally:
        conn.close()


@dashboard_bp.route('/messages/<int:msg_id>/read', methods=['PUT'])
@token_required
def mark_read(msg_id):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE messages SET is_read = TRUE WHERE id = %s", (msg_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Pesan ditandai sudah dibaca."})
    finally:
        conn.close()


@dashboard_bp.route('/messages/<int:msg_id>', methods=['DELETE'])
@token_required
def delete_message(msg_id):
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Pesan dihapus."})
    finally:
        conn.close()