from flask import Blueprint, jsonify, request
from model import get_db
from Backend.Admin.login import token_required
import cloudinary
import cloudinary.uploader

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/upload', methods=['POST'])
@token_required
def upload_file():
    """Upload image to Cloudinary (multipart/form-data)."""
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "Tidak ada file yang diupload."}), 400

    file = request.files['file']
    upload_type = request.form.get('type', 'general') 

    if file.filename == '':
        return jsonify({"success": False, "message": "Nama file kosong."}), 400

    allowed = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({"success": False, "message": f"Tipe file tidak diizinkan. Gunakan: {', '.join(allowed)}"}), 400

    try:
        folder = "portfolio/profile" if upload_type == 'profile' else "portfolio/projects"
        transformation = []
        if upload_type == 'profile':
            transformation = [
                {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        else:
            transformation = [
                {"width": 800, "height": 500, "crop": "fill"},
                {"quality": "auto", "fetch_format": "auto"}
            ]

        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            overwrite=True,
            transformation=transformation
        )

        url = result['secure_url']
        public_id = result['public_id']

        if upload_type == 'profile':
            conn = get_db()
            try:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "UPDATE profile SET photo_url=%s, photo_public_id=%s WHERE id=1",
                        (url, public_id)
                    )
                conn.commit()
            finally:
                conn.close()

        return jsonify({
            "success": True,
            "message": "Upload berhasil.",
            "data": {"url": url, "public_id": public_id}
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Gagal upload: {str(e)}"}), 500


@upload_bp.route('/upload/delete', methods=['POST'])
@token_required
def delete_upload():
    """Delete image from Cloudinary."""
    data = request.get_json()
    public_id = data.get('public_id')
    if not public_id:
        return jsonify({"success": False, "message": "public_id wajib diisi."}), 400
    try:
        cloudinary.uploader.destroy(public_id)
        return jsonify({"success": True, "message": "Gambar berhasil dihapus dari Cloudinary."})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
