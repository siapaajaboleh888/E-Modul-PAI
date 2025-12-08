# E-Modul Interaktif PAI

Aplikasi web untuk E-Modul Interaktif Pendidikan Agama Islam (PAI) dengan integrasi Problem-Based Learning (PBL) dan nilai keberagamaan transformatif di PTU.

## 📚 Stack Teknologi

- **Backend**: Node.js + Express
- **Template Engine**: EJS (server-side rendering)
- **Styling**: Bootstrap 5 (UI responsive)
- **Database**: MySQL
- **Session**: SQLite (untuk session storage)

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat
Pastikan sudah terinstall:
- Node.js (versi 14 atau lebih baru)
- MySQL Server
- Git (opsional)

### 2. Setup Database MySQL

#### a. Buat Database Baru
Buka MySQL client (MySQL Workbench, TablePlus, atau command line) dan jalankan:

```sql
CREATE DATABASE emodul_pai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### b. Import Schema Database
Jalankan file SQL berikut secara berurutan:

```sql
-- 1. Schema dasar
SOURCE d:/EModul/sql/schema-mysql.sql;

-- 2. Schema aktivitas
SOURCE d:/EModul/sql/schema-activities-mysql.sql;

-- 3. Schema fitur tambahan (PBL, Media, Nilai Transformatif, dll)
SOURCE d:/EModul/sql/schema-extended-features.sql;

-- 4. Data seed modul utama (opsional)
SOURCE d:/EModul/sql/seed-main-module-mysql.sql;

-- 5. Data seed soal kuis (opsional)
SOURCE d:/EModul/sql/seed-questions-main-module-mysql.sql;
```

**Atau** jika menggunakan command line:
```bash
mysql -u root -p emodul_pai < d:/EModul/sql/schema-mysql.sql
mysql -u root -p emodul_pai < d:/EModul/sql/schema-activities-mysql.sql
mysql -u root -p emodul_pai < d:/EModul/sql/schema-extended-features.sql
mysql -u root -p emodul_pai < d:/EModul/sql/seed-main-module-mysql.sql
mysql -u root -p emodul_pai < d:/EModul/sql/seed-questions-main-module-mysql.sql
```

### 3. Konfigurasi Environment

Buat atau edit file `.env` di root folder proyek:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=emodul_pai

# Server Configuration
PORT=3000
HOST=0.0.0.0
```

### 4. Install Dependencies

Buka terminal di folder `d:\EModul` dan jalankan:

```bash
npm install
```

### 5. Jalankan Aplikasi

#### Mode Development (dengan auto-reload):
```bash
npm run dev
```

#### Mode Production:
```bash
npm start
```

### 6. Akses Aplikasi

Buka browser dan akses: **http://localhost:3000**

### 7. Login Default

Setelah menjalankan seed data, gunakan akun berikut:

**Admin:**
- Email: `admin@emodul-pai.local`
- Password: `admin123`

**Dosen:**
- Email: `dosen@emodul-pai.local`
- Password: `dosen123`

**Mahasiswa:**
- Email: `mahasiswa@emodul-pai.local`
- Password: `mahasiswa123`

## 📋 Fitur Lengkap Aplikasi

### 🎓 **MAHASISWA (STUDENT)**

#### Dashboard
- Ringkatan progres belajar
- Modul terakhir diakses
- Aktivitas yang perlu dikerjakan

#### Modul Pembelajaran
- Tambah/Edit/Hapus konten teks
- Upload media digital (video/animasi)
- Urutkan materi

#### Skenario PBL
- Daftar skenario PBL
- Detail skenario PBL
- Panduan pengerjaan

#### Aktivitas Interaktif
- Kumpulan Kuis Format
- Latihan Soal Interaktif
- Pemantauan Evaluasi/Simulasi

#### Progres Belajar
- Visualisasi progres per modul
- Status penyelesaian unit
- Riwayat aktivitas

#### Penilaian Refleksi & Tugas
- **BARU!** Daftar semua tugas yang sudah dikerjakan
- **BARU!** Nilai dan feedback dari dosen
- **BARU!** Riwayat kuis dan skor

#### Laporan Akhir Progres
- **BARU!** Statistik keseluruhan pembelajaran
- **BARU!** Rata-rata nilai tugas dan kuis
- **BARU!** Progres per modul

#### Glosarium
- Daftar istilah PAI
- Informasi rujukan

#### Pengaturan/Profil
- Ganti password
- Logout

---

### 👨‍🏫 **DOSEN (LECTURER)**

#### Dashboard Dosen
- Statistik sistem terbatas
- Ringkasan kelas yang diajar

#### Manajemen Modul & Materi
- **BARU!** Lihat semua modul
- **BARU!** Upload materi digital (video/animasi)
- **BARU!** Integrasi media ke dalam unit

#### Manajemen Skenario PBL
- **BARU!** Tambah skenario PBL baru
- **BARU!** Edit/Hapus skenario PBL
- **BARU!** Kelola learning objectives
- **BARU!** Kelola problem statement

#### Manajemen Media Digital
- **BARU!** Upload media (video, animasi, audio, dokumen)
- **BARU!** Kelola library media
- **BARU!** Optimasi ukuran media secara otomatis

#### Penilaian Refleksi & Tugas
- **BARU!** Daftar tugas yang perlu dinilai
- **BARU!** Beri nilai dan feedback
- **BARU!** Manual (integrasi ke tugas keberagamaan)

#### Laporan & Analisis Kelas
- **BARU!** Statistik kelas (total mahasiswa, aktivitas, rata-rata nilai)
- **BARU!** Progres per mahasiswa
- **BARU!** Detail progres individual
- **BARU!** Filter berdasarkan nilai atau modul tertentu

#### Manajemen Pengguna (Dosen)
- **BARU!** Lihat daftar mahasiswa
- **BARU!** Detail profil mahasiswa

---

### 👨‍💼 **ADMINISTRATOR (ADMIN)**

#### Dashboard Admin
- Statistik sistem lengkap
- Jumlah modul aktif
- Jumlah pengguna
- Log aktivitas

#### Manajemen Modul & Materi
- Tambah/Edit/Hapus modul
- Tambah/Edit/Hapus unit
- Upload media digital (video/animasi)
- Integrasi media ke dalam unit

#### Manajemen Skenario PBL
- Tambah Soal Skenario PBL baru
- Edit/Hapus skenario PBL
- Kelola learning objectives

#### Manajemen Aktivitas Interaktif
- Kumpulan Kuis Format
- Latihan Soal Interaktif
- Pemantauan Evaluasi/Simulasi

#### Manajemen Pengguna
- Tambah/Edit/Hapus akun (Mahasiswa, Dosen, Admin)
- Kelola status pengguna
- Kelola akses

#### Manajemen Media Digital
- **BARU!** Upload media (video, animasi, audio, dokumen)
- **BARU!** Kelola library media
- **BARU!** Hapus media yang tidak terpakai

#### Manajemen Nilai Transformatif
- **BARU!** Tambah/Edit/Hapus nilai transformatif
- **BARU!** Definisi indikator nilai
- **BARU!** Penilaian nilai transformatif per mahasiswa
- **BARU!** Laporan nilai transformatif

#### Laporan & Analisis Kelas
- Laporan detail progres per mahasiswa
- Filter berdasarkan nilai atau modul tertentu
- Ekspor data (CSV/Excel)

#### Pengaturan Sistem
- **BARU!** Tema (light/dark)
- **BARU!** Kelola database
- **BARU!** Log sistem
- **BARU!** Backup & restore

---

## 🗂️ Struktur Proyek

```
d:\EModul\
├── src/
│   ├── app.js                 # Entry point aplikasi
│   ├── routes/
│   │   ├── auth.js           # Routes autentikasi
│   │   ├── student.js        # Routes mahasiswa
│   │   ├── lecturer.js       # Routes dosen (DIPERLUAS)
│   │   └── admin.js          # Routes admin (DIPERLUAS)
│   └── services/
│       └── db-mysql.js       # Database service
├── views/                     # Template EJS
│   ├── student/              # Views mahasiswa
│   ├── lecturer/             # Views dosen
│   ├── admin/                # Views admin
│   └── layout.ejs            # Layout utama
├── public/                    # Static files (CSS, JS, images)
├── sql/                       # SQL schema & seed files
│   ├── schema-mysql.sql
│   ├── schema-activities-mysql.sql
│   ├── schema-extended-features.sql  # BARU!
│   ├── seed-main-module-mysql.sql
│   └── seed-questions-main-module-mysql.sql
├── db/                        # SQLite session storage
├── .env                       # Environment variables
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### Error: Cannot connect to MySQL
- Pastikan MySQL server sudah berjalan
- Periksa konfigurasi di file `.env`
- Pastikan database `emodul_pai` sudah dibuat

### Error: Table doesn't exist
- Pastikan semua file SQL schema sudah dijalankan
- Jalankan ulang file SQL secara berurutan

### Port 3000 sudah digunakan
- Ubah PORT di file `.env` menjadi port lain (misalnya 3001)

## 📝 Catatan Pengembangan

### Fitur yang Baru Ditambahkan:
1. **Dosen**: Manajemen modul, PBL, media, penilaian, laporan, pengguna
2. **Mahasiswa**: Penilaian & tugas, laporan progres
3. **Admin**: Media digital, nilai transformatif, pengaturan sistem

### Tabel Database Baru:
- `pbl_scenarios` - Skenario PBL
- `digital_media` - Media digital
- `transformative_values` - Nilai transformatif
- `transformative_assessments` - Penilaian nilai transformatif
- `system_settings` - Pengaturan sistem
- `activity_logs` - Log aktivitas

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi tim pengembang.

---

**E-Modul PAI** - Pembelajaran PAI di Perguruan Tinggi

