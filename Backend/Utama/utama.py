from flask import Blueprint, jsonify, request
from model import get_db
from dotenv import load_dotenv
import os
import resend

load_dotenv()

utama_bp = Blueprint('utama', __name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

resend.api_key = RESEND_API_KEY

print("RESEND KEY:", "TERBACA" if RESEND_API_KEY else "TIDAK TERBACA")
print("RESEND FROM:", RESEND_FROM_EMAIL)
print("ADMIN EMAIL:", ADMIN_EMAIL)

@utama_bp.route('/portfolio', methods=['GET'])
def get_portfolio():
    """Get all portfolio data for public display."""
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM profile WHERE id = 1")
            profile = cursor.fetchone()

            cursor.execute("SELECT * FROM skills ORDER BY sort_order, id")
            skills = cursor.fetchall()

            cursor.execute("SELECT * FROM experience ORDER BY sort_order, id")
            experience = cursor.fetchall()

            cursor.execute("SELECT * FROM projects ORDER BY sort_order, id")
            projects = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": {
                "profile": profile,
                "skills": skills,
                "experience": experience,
                "projects": projects
            }
        })
    finally:
        conn.close()


@utama_bp.route('/contact', methods=['POST'])
def send_contact():
    """Handle contact form submission."""
    data = request.get_json()

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', 'Pesan dari Portfolio').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({
            "success": False,
            "message": "Nama, email, dan pesan wajib diisi."
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO messages (sender_name, sender_email, subject, message)
                VALUES (%s, %s, %s, %s)
            """, (name, email, subject, message))

        conn.commit()

        try:
            if not RESEND_API_KEY:
                raise Exception("RESEND_API_KEY tidak terbaca dari .env")

            resend.api_key = RESEND_API_KEY

            resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": ADMIN_EMAIL,
                "subject": f"📬 Pesan Baru dari Portfolio: {subject}",
                "html": f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color:#3b82f6;">Pesan Baru dari Portfolio</h2>

                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px; font-weight:bold; width:100px;">Nama</td>
                            <td style="padding:8px;">{name}</td>
                        </tr>
                        <tr style="background:#f0f9ff;">
                            <td style="padding:8px; font-weight:bold;">Email</td>
                            <td style="padding:8px;">
                                <a href="mailto:{email}">{email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px; font-weight:bold;">Subjek</td>
                            <td style="padding:8px;">{subject}</td>
                        </tr>
                    </table>

                    <div style="margin-top:16px; padding:16px; background:#f0f9ff; border-left:4px solid #3b82f6; border-radius:4px;">
                        <p style="margin:0; white-space:pre-wrap;">{message}</p>
                    </div>

                    <p style="color:#94a3b8; font-size:12px; margin-top:24px;">
                        Dikirim dari form kontak portfolio Anda.
                    </p>
                </div>
                """
            })

        except Exception as e:
            print(f"⚠️ Resend error: {e}")

        return jsonify({
            "success": True,
            "message": "Pesan berhasil dikirim! Terima kasih telah menghubungi saya."
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Gagal mengirim pesan: {str(e)}"
        }), 500

    finally:
        conn.close()