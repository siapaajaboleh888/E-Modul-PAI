# 🚀 PANDUAN MENJALANKAN PROYEK E-MODUL PAI

## Langkah-Langkah Setup dan Menjalankan Proyek

### 📋 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:
1. **Node.js** (versi 14 atau lebih baru) - [Download di sini](https://nodejs.org/)
2. **MySQL Server** (versi 5.7 atau lebih baru) - [Download di sini](https://dev.mysql.com/downloads/mysql/)
3. **Git** (opsional) - [Download di sini](https://git-scm.com/)

---

## 🗄️ STEP 1: Setup Database MySQL

### 1.1. Jalankan MySQL Server

**Windows:**
- Buka **Services** (tekan `Win + R`, ketik `services.msc`)
- Cari **MySQL** atau **MySQL80**
- Klik kanan → **Start**

**Atau** jalankan dari Command Prompt:
```cmd
net start MySQL80
```

### 1.2. Buat Database Baru

Buka MySQL client (MySQL Workbench, TablePlus, HeidiSQL, atau command line):

**Menggunakan Command Line:**
```bash
# Login ke MySQL
mysql -u root -p

# Masukkan password MySQL Anda
# Kemudian jalankan perintah berikut:
```

**Di MySQL prompt:**
```sql
CREATE DATABASE emodul_pai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emodul_pai;
```

### 1.3. Import Schema Database

Jalankan file SQL berikut **secara berurutan**:

**Opsi 1: Menggunakan MySQL Command Line**
```bash
# Pastikan Anda berada di folder d:\EModul
cd d:\EModul

# Import schema dasar
mysql -u root -p emodul_pai < sql/schema-mysql.sql

# Import schema aktivitas
mysql -u root -p emodul_pai < sql/schema-activities-mysql.sql

# Import schema fitur tambahan (BARU!)
mysql -u root -p emodul_pai < sql/schema-extended-features.sql

# Import data seed modul utama (opsional)
mysql -u root -p emodul_pai < sql/seed-main-module-mysql.sql

# Import data seed soal kuis (opsional)
mysql -u root -p emodul_pai < sql/seed-questions-main-module-mysql.sql
```

**Opsi 2: Menggunakan MySQL Workbench / TablePlus**
1. Buka MySQL Workbench atau TablePlus
2. Connect ke MySQL server
3. Pilih database `emodul_pai`
4. Buka dan jalankan file SQL satu per satu:
   - `sql/schema-mysql.sql`
   - `sql/schema-activities-mysql.sql`
   - `sql/schema-extended-features.sql`
   - `sql/seed-main-module-mysql.sql`
   - `sql/seed-questions-main-module-mysql.sql`

### 1.4. Verifikasi Database

Pastikan semua tabel sudah terbuat:
```sql
USE emodul_pai;
SHOW TABLES;
```

Anda seharusnya melihat tabel-tabel berikut:
- `users`
- `modules`
- `units`
- `materials`
- `activities`
- `questions`
- `activity_attempts`
- `task_submissions`
- `student_progress`
- `pbl_scenarios` ← BARU
- `digital_media` ← BARU
- `transformative_values` ← BARU
- `transformative_assessments` ← BARU
- `system_settings` ← BARU
- `activity_logs` ← BARU

---

## ⚙️ STEP 2: Konfigurasi Environment

### 2.1. Buat File .env

Buka folder `d:\EModul` dan buat file `.env` (jika belum ada):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=emodul_pai

# Server Configuration
PORT=3000
HOST=0.0.0.0
```

**PENTING:** Ganti `your_mysql_password_here` dengan password MySQL Anda!

### 2.2. Verifikasi File .env

Pastikan file `.env` sudah benar:
- Tidak ada spasi sebelum atau sesudah `=`
- Password MySQL sudah benar
- Nama database adalah `emodul_pai`

---

## 📦 STEP 3: Install Dependencies

Buka **Command Prompt** atau **PowerShell** dan jalankan:

```bash
# Pindah ke folder proyek
cd d:\EModul

# Install semua dependencies
npm install
```

Tunggu hingga proses instalasi selesai. Anda akan melihat folder `node_modules` terbuat.

---

## 🎯 STEP 4: Jalankan Aplikasi

### 4.1. Mode Development (Recommended)

Mode ini akan auto-reload ketika ada perubahan kode:

```bash
npm run dev
```

Anda akan melihat output:
```
[nodemon] starting `node src/app.js`
E-Modul Interaktif PAI running on http://localhost:3000
```

### 4.2. Mode Production

Untuk production (tanpa auto-reload):

```bash
npm start
```

---

## 🌐 STEP 5: Akses Aplikasi

### 5.1. Buka Browser

Buka browser favorit Anda (Chrome, Firefox, Edge) dan akses:

```
http://localhost:3000
```

### 5.2. Login dengan Akun Default

Setelah menjalankan seed data, gunakan akun berikut untuk login:

#### 👨‍💼 **Admin**
- **Email:** `admin@emodul-pai.local`
- **Password:** `admin123`
- **Akses:** Semua fitur sistem

#### 👨‍🏫 **Dosen**
- **Email:** `dosen@emodul-pai.local`
- **Password:** `dosen123`
- **Akses:** Manajemen modul, PBL, media, penilaian, laporan

#### 🎓 **Mahasiswa**
- **Email:** `mahasiswa@emodul-pai.local`
- **Password:** `mahasiswa123`
- **Akses:** Modul pembelajaran, kuis, tugas, progres

---

## 🧪 STEP 6: Testing Fitur

### 6.1. Test Fitur Mahasiswa

1. Login sebagai mahasiswa
2. Klik **Dashboard** → Lihat ringkasan progres
3. Klik **Modul Pembelajaran** → Pilih modul
4. Klik **Aktivitas Interaktif** → Kerjakan kuis
5. Klik **Penilaian & Tugas** → Lihat nilai (BARU!)
6. Klik **Laporan Progres** → Lihat statistik (BARU!)

### 6.2. Test Fitur Dosen

1. Login sebagai dosen
2. Klik **Dashboard** → Lihat statistik kelas
3. Klik **Manajemen Modul** → Lihat semua modul (BARU!)
4. Klik **Skenario PBL** → Tambah skenario baru (BARU!)
5. Klik **Media Digital** → Upload media (BARU!)
6. Klik **Penilaian Tugas** → Nilai tugas mahasiswa (BARU!)
7. Klik **Laporan Kelas** → Lihat progres mahasiswa (BARU!)

### 6.3. Test Fitur Admin

1. Login sebagai admin
2. Klik **Dashboard** → Lihat statistik sistem
3. Klik **Manajemen Pengguna** → Tambah user baru
4. Klik **Media Digital** → Upload dan kelola media (BARU!)
5. Klik **Nilai Transformatif** → Kelola nilai keberagamaan (BARU!)
6. Klik **Pengaturan Sistem** → Ubah konfigurasi (BARU!)

---

## 🔧 Troubleshooting

### ❌ Error: "Cannot connect to MySQL"

**Solusi:**
1. Pastikan MySQL server sudah berjalan
2. Cek file `.env` → pastikan password benar
3. Test koneksi MySQL:
   ```bash
   mysql -u root -p
   ```

### ❌ Error: "Table doesn't exist"

**Solusi:**
1. Pastikan semua file SQL schema sudah dijalankan
2. Jalankan ulang file SQL secara berurutan:
   ```bash
   mysql -u root -p emodul_pai < sql/schema-mysql.sql
   mysql -u root -p emodul_pai < sql/schema-activities-mysql.sql
   mysql -u root -p emodul_pai < sql/schema-extended-features.sql
   ```

### ❌ Error: "Port 3000 already in use"

**Solusi:**
1. Ubah PORT di file `.env`:
   ```env
   PORT=3001
   ```
2. Atau stop aplikasi yang menggunakan port 3000

### ❌ Error: "Module not found"

**Solusi:**
1. Hapus folder `node_modules`:
   ```bash
   rmdir /s node_modules
   ```
2. Install ulang dependencies:
   ```bash
   npm install
   ```

### ❌ Error: "Cannot find module 'dotenv'"

**Solusi:**
```bash
npm install dotenv
```

### ❌ Halaman tidak muncul / Error 404

**Solusi:**
1. Pastikan Anda sudah login
2. Cek URL yang diakses
3. Periksa console browser (F12) untuk error

---

## 📝 Catatan Penting

### 🔐 Keamanan
- **Jangan** gunakan password default di production!
- Ganti semua password default setelah setup
- Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf, angka, simbol)

### 💾 Backup Database
- Lakukan backup database secara berkala
- Gunakan fitur backup di menu **Admin → Pengaturan Sistem → Backup**

### 🚀 Performance
- Untuk production, gunakan `npm start` bukan `npm run dev`
- Pertimbangkan menggunakan PM2 untuk process management
- Optimalkan ukuran media yang diupload

---

## 📚 Dokumentasi Tambahan

- **README.md** - Dokumentasi umum proyek
- **ANALISIS_FITUR.md** - Analisis lengkap fitur yang tersedia
- **sql/** - Schema dan seed data database

---

## 🆘 Bantuan

Jika masih ada masalah:
1. Periksa log error di terminal
2. Periksa console browser (F12)
3. Pastikan semua langkah sudah diikuti dengan benar
4. Hubungi tim pengembang

---

## ✅ Checklist Setup

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

- [ ] MySQL Server sudah terinstall dan berjalan
- [ ] Database `emodul_pai` sudah dibuat
- [ ] Semua file SQL schema sudah dijalankan (5 file)
- [ ] File `.env` sudah dibuat dan dikonfigurasi
- [ ] Dependencies sudah diinstall (`npm install`)
- [ ] Aplikasi berhasil dijalankan (`npm run dev`)
- [ ] Bisa akses http://localhost:3000
- [ ] Bisa login dengan akun default
- [ ] Semua fitur berjalan dengan baik

---

**Selamat! Proyek E-Modul PAI Anda sudah siap digunakan! 🎉**
