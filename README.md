# 🌐 Tugas Individu — Portofolio Web Berbasis Flask

Aplikasi web portofolio dinamis dengan panel admin CRUD, upload gambar via Cloudinary, pengiriman email via Resend, dan database TiDB (MySQL-compatible).

---

## ✨ Fitur
- **Halaman Portfolio** — tampilan publik dinamis (profil, skills, pengalaman, proyek, kontak)
- **Panel Admin** — login OTP via email, CRUD semua data portfolio
- **Upload Gambar** — foto profil & gambar proyek via Cloudinary
- **Kirim Email** — form kontak + notifikasi admin via Resend
- **Ganti Background** — pilih warna background portfolio langsung dari admin

---

## 🔧 Teknologi
- **Backend**: Python, Flask, PyMySQL, PyJWT
- **Database**: TiDB (MySQL-compatible cloud)
- **Storage**: Cloudinary (gambar)
- **Email**: Resend
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

---

## 🚀 Cara Menjalankan

### 1. Install dependensi
```bash
pip install -r requirements.txt
```

### 2. Konfigurasi `.env`
Salin `.env.example` menjadi `.env` dan isi dengan kredensial kamu:
```bash
cp .env.example .env
```

Edit `.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` → kredensial TiDB
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → dari dashboard Cloudinary
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` → dari dashboard Resend
- `ADMIN_EMAIL` → email yang bisa login sebagai admin

### 3. Jalankan aplikasi
```bash
python app.py
```

Buka browser di: **http://localhost:5000**

---

## 📁 Struktur Folder
```
TUGAS_INDIVIDU_PORTOFOLIO/
├── Backend/
│   ├── Admin/          # Blueprint Flask (login, dashboard, profiles, skills, experience, projects, upload)
│   └── Utama/          # Blueprint Flask (API publik portfolio)
├── Frontend/
│   ├── Admin/          # HTML, CSS, JS panel admin
│   │   ├── css/
│   │   ├── js/
│   │   └── *.html
│   └── Utama/          # CSS & JS halaman portfolio publik
├── .env                # Konfigurasi (JANGAN di-commit)
├── .env.example        # Template konfigurasi
├── app.py              # Entry point Flask
├── config.py           # Kelas konfigurasi
├── model.py            # Koneksi DB & inisialisasi tabel
├── database.sql        # Skema database SQL
├── index.html          # Halaman portfolio publik
└── requirements.txt    # Dependensi Python
```

---

## 🔐 Login Admin
1. Buka `http://localhost:5000/Frontend/admin/login.html`
2. Masukkan email admin (sesuai `ADMIN_EMAIL` di `.env`)
3. Kode OTP 6 digit akan dikirim ke email tersebut via Resend
4. Masukkan OTP → login berhasil

---

## 📋 API Endpoints
| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/portfolio` | Data portfolio publik |
| POST | `/api/contact` | Kirim pesan kontak |
| POST | `/api/admin/request-otp` | Minta OTP login |
| POST | `/api/admin/verify-otp` | Verifikasi OTP |
| GET/PUT | `/api/admin/profile` | CRUD profil |
| GET/POST | `/api/admin/skills` | CRUD skills |
| GET/POST | `/api/admin/experience` | CRUD pengalaman |
| GET/POST | `/api/admin/projects` | CRUD proyek |
| POST | `/api/admin/upload` | Upload gambar ke Cloudinary |
