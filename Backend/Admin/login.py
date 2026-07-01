from flask import Blueprint, jsonify, request
from model import get_db
from config import Config
import jwt
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

login_bp = Blueprint('login', __name__)


def create_token(email):
    payload = {
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')


def verify_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return jsonify({
                "success": False,
                "message": "Token tidak ditemukan. Silakan login."
            }), 401

        email = verify_token(token)

        if not email:
            return jsonify({
                "success": False,
                "message": "Token tidak valid atau sudah expired."
            }), 401

        return f(*args, **kwargs)

    return decorated


@login_bp.route('/register', methods=['POST'])
def admin_register():
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    confirm_password = data.get('confirm_password', '').strip()

    if not email or not password or not confirm_password:
        return jsonify({
            "success": False,
            "message": "Email, password, dan konfirmasi password wajib diisi."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password minimal 6 karakter."
        }), 400

    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Konfirmasi password tidak sama."
        }), 400

    password_hash = generate_password_hash(password)

    conn = get_db()

    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id FROM admin
                WHERE email = %s
            """, (email,))
            existing_admin = cursor.fetchone()

            if existing_admin:
                return jsonify({
                    "success": False,
                    "message": "Email sudah terdaftar."
                }), 409

            cursor.execute("""
                INSERT INTO admin (email, password_hash)
                VALUES (%s, %s)
            """, (email, password_hash))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Register berhasil. Silakan login."
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Gagal register: {str(e)}"
        }), 500

    finally:
        conn.close()


@login_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email dan password wajib diisi."
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, email, password_hash
                FROM admin
                WHERE email = %s
            """, (email,))
            admin = cursor.fetchone()

        if not admin:
            return jsonify({
                "success": False,
                "message": "Email tidak terdaftar."
            }), 403

        if not admin.get('password_hash'):
            return jsonify({
                "success": False,
                "message": "Password akun ini belum diatur."
            }), 500

        if not check_password_hash(admin['password_hash'], password):
            return jsonify({
                "success": False,
                "message": "Password salah."
            }), 401

        token = create_token(email)

        return jsonify({
            "success": True,
            "message": "Login berhasil.",
            "token": token,
            "email": email
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Gagal login: {str(e)}"
        }), 500

    finally:
        conn.close()


@login_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        "success": True,
        "message": "Logout berhasil."
    })


@login_bp.route('/check-auth', methods=['GET'])
@token_required
def check_auth():
    return jsonify({
        "success": True,
        "message": "Authenticated."
    })