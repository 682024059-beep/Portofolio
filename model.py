import pymysql
import pymysql.cursors
from config import Config


def get_db():
    """Get database connection"""
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        ssl={"ssl": True} if Config.DB_HOST != "localhost" else {}
    )


def init_db():
    """Initialize database and seed data"""

    # Create database first
    conn = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        ssl={"ssl": True} if Config.DB_HOST != "localhost" else {}
    )

    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}`
                CHARACTER SET utf8mb4
                COLLATE utf8mb4_unicode_ci
            """)
        conn.commit()
        print(f"✅ Database '{Config.DB_NAME}' siap.")

    finally:
        conn.close()

    # Connect to created DB
    conn = get_db()

    try:
        with conn.cursor() as cursor:

            # Admin
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS admin (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    otp_code VARCHAR(6),
                    otp_expires_at DATETIME,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Profile
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS profile (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    tagline VARCHAR(500),
                    bio TEXT,
                    photo_url TEXT,
                    photo_public_id VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    location VARCHAR(255),
                    github_url VARCHAR(500),
                    linkedin_url VARCHAR(500),
                    instagram_url VARCHAR(500),
                    resume_url TEXT,
                    background_color VARCHAR(20) DEFAULT '#dbeafe',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
                )
            """)

            # Skills
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS skills (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    icon_url TEXT,
                    level INT DEFAULT 80,
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Experience
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS experience (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    company VARCHAR(255),
                    period VARCHAR(100),
                    description TEXT,
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Projects
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    description TEXT,
                    image_url TEXT,
                    image_public_id VARCHAR(255),
                    tech_stack VARCHAR(500),
                    demo_url VARCHAR(500),
                    code_url VARCHAR(500),
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Messages
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sender_name VARCHAR(255),
                    sender_email VARCHAR(255),
                    subject VARCHAR(500),
                    message TEXT,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Seed admin
            cursor.execute(
                "INSERT IGNORE INTO admin (email) VALUES (%s)",
                (Config.ADMIN_EMAIL,)
            )

        conn.commit()
        print("✅ Database initialized successfully!")

    finally:
        conn.close()


if __name__ == "__main__":
    init_db()