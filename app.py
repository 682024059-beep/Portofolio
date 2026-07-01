from flask import Flask, send_from_directory
from flask_cors import CORS
import cloudinary

from config import Config
from model import init_db

# Import blueprints
from Backend.Utama.utama import utama_bp
from Backend.Admin.login import login_bp
from Backend.Admin.dashboard import dashboard_bp
from Backend.Admin.profiles import profiles_bp
from Backend.Admin.skills import skills_bp
from Backend.Admin.experience import experience_bp
from Backend.Admin.projects import projects_bp
from Backend.Admin.upload import upload_bp


app = Flask(__name__, static_folder='.', static_url_path='')
app.config.from_object(Config)

CORS(app)

# Cloudinary config
cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)

# Register blueprints
app.register_blueprint(utama_bp, url_prefix='/api')

app.register_blueprint(login_bp, url_prefix='/api/admin')
app.register_blueprint(dashboard_bp, url_prefix='/api/admin')
app.register_blueprint(profiles_bp, url_prefix='/api/admin')
app.register_blueprint(skills_bp, url_prefix='/api/admin')
app.register_blueprint(experience_bp, url_prefix='/api/admin')
app.register_blueprint(projects_bp, url_prefix='/api/admin')
app.register_blueprint(upload_bp, url_prefix='/api/admin')


# =========================
# FRONTEND ROUTES
# =========================

# Portfolio utama
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


# Login admin
@app.route('/admin')
def admin():
    return send_from_directory('Frontend/Admin', 'login.html')

@app.route('/admin/register')
def admin_register_page():
    return send_from_directory('Frontend/Admin', 'register.html')


# File admin (css/js/html)
@app.route('/Frontend/admin/<path:filename>')
def admin_frontend(filename):
    return send_from_directory('Frontend/Admin', filename)


# File utama
@app.route('/Frontend/utama/<path:filename>')
def utama_frontend(filename):
    return send_from_directory('Frontend/Utama', filename)


# Favicon
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico')


# =========================
# RUN APP
# =========================

if __name__ == '__main__':
    print("🚀 Initializing database...")
    init_db()

    print("🌐 Starting Flask server at http://127.0.0.1:5000")

    app.run(
        debug=Config.DEBUG,
        host='0.0.0.0',
        port=5000
    )

