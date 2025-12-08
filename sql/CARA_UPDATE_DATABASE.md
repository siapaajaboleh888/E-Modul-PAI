# 🗄️ CARA UPDATE DATABASE E-MODUL PAI

## 📋 Panduan Lengkap Update Database

Ikuti langkah-langkah berikut untuk mengupdate database Anda dengan tabel-tabel baru.

---

## 🎯 OPSI 1: Menggunakan TablePlus / MySQL Workbench (RECOMMENDED)

### Langkah 1: Buka TablePlus
1. Buka aplikasi **TablePlus**
2. Connect ke MySQL server Anda
3. Pilih database **emodul_pai**

### Langkah 2: Jalankan SQL Script
1. Klik menu **SQL** → **New Query** (atau tekan `Ctrl+T`)
2. Buka file: `d:\EModul\sql\UPDATE_DATABASE_LENGKAP.sql`
3. Copy semua isi file tersebut
4. Paste ke query editor TablePlus
5. Klik **Run** (atau tekan `Ctrl+Enter`)

### Langkah 3: Verifikasi
Setelah script selesai dijalankan, Anda akan melihat:
- Pesan sukses di console
- Daftar semua tabel (termasuk 6 tabel baru)

---

## 🎯 OPSI 2: Menggunakan Command Line

### Langkah 1: Buka Command Prompt
```bash
# Pindah ke folder proyek
cd d:\EModul
```

### Langkah 2: Jalankan SQL Script
```bash
# Jalankan script update
mysql -u root -p emodul_pai < sql/UPDATE_DATABASE_LENGKAP.sql
```

### Langkah 3: Masukkan Password
- Masukkan password MySQL Anda
- Tunggu hingga proses selesai

### Langkah 4: Verifikasi
```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE emodul_pai;

# Lihat semua tabel
SHOW TABLES;

# Keluar
EXIT;
```

---

## 🎯 OPSI 3: Copy-Paste Manual di TablePlus

Jika Anda lebih suka copy-paste manual, berikut SQL yang perlu dijalankan:

### 1. Buat Tabel PBL Scenarios
```sql
USE emodul_pai;

CREATE TABLE IF NOT EXISTS pbl_scenarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  learning_objectives TEXT,
  problem_statement TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pbl_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Buat Tabel Digital Media
```sql
CREATE TABLE IF NOT EXISTS digital_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  media_type ENUM('VIDEO', 'ANIMATION', 'IMAGE', 'AUDIO', 'DOCUMENT') NOT NULL,
  media_url TEXT NOT NULL,
  description TEXT,
  uploaded_by INT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Buat Tabel Transformative Values
```sql
CREATE TABLE IF NOT EXISTS transformative_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value_name VARCHAR(255) NOT NULL,
  description TEXT,
  indicators TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Buat Tabel Transformative Assessments
```sql
CREATE TABLE IF NOT EXISTS transformative_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  value_id INT NOT NULL,
  score DECIMAL(5,2),
  notes TEXT,
  assessed_by INT,
  assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trans_assess_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_trans_assess_value FOREIGN KEY (value_id) REFERENCES transformative_values(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_trans_assess_assessor FOREIGN KEY (assessed_by) REFERENCES users(id)
    ON DELETE SET NULL,
  UNIQUE KEY unique_student_value (student_id, value_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Buat Tabel System Settings
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. Buat Tabel Activity Logs
```sql
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. Update Tabel Task Submissions
```sql
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS graded_at DATETIME;
```

**CATATAN:** Jika perintah di atas error, gunakan ini:
```sql
-- Cek apakah kolom sudah ada
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'emodul_pai' 
AND TABLE_NAME = 'task_submissions' 
AND COLUMN_NAME = 'graded_at';

-- Jika tidak ada hasil, jalankan:
ALTER TABLE task_submissions ADD COLUMN graded_at DATETIME;
```

### 8. Insert Data Default Nilai Transformatif
```sql
INSERT INTO transformative_values (value_name, description, indicators) VALUES
('Toleransi Beragama', 'Kemampuan menghargai dan menghormati perbedaan keyakinan', 'Menunjukkan sikap terbuka terhadap perbedaan, Tidak diskriminatif, Aktif dalam dialog antar agama'),
('Moderasi Beragama', 'Pemahaman dan praktik beragama yang seimbang dan moderat', 'Menghindari ekstremisme, Menerapkan nilai-nilai Islam rahmatan lil alamin, Bersikap adil dan bijaksana'),
('Integritas Akademik', 'Kejujuran dan tanggung jawab dalam pembelajaran', 'Tidak menyontek, Mengerjakan tugas sendiri, Menghargai karya orang lain'),
('Kepedulian Sosial', 'Kesadaran dan aksi nyata untuk membantu sesama', 'Aktif dalam kegiatan sosial, Empati terhadap sesama, Berkontribusi untuk masyarakat'),
('Refleksi Diri', 'Kemampuan introspeksi dan evaluasi diri', 'Menulis refleksi berkala, Mengevaluasi perkembangan diri, Menetapkan target perbaikan')
ON DUPLICATE KEY UPDATE value_name = VALUES(value_name);
```

### 9. Insert Data Default Pengaturan Sistem
```sql
INSERT INTO system_settings (setting_key, setting_value) VALUES
('siteName', 'E-Modul PAI'),
('siteDescription', 'Pembelajaran PAI di Perguruan Tinggi'),
('theme', 'light'),
('enableRegistration', '1'),
('maintenanceMode', '0')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
```

---

## ✅ VERIFIKASI DATABASE

Setelah menjalankan semua SQL di atas, verifikasi dengan:

```sql
-- Lihat semua tabel
SHOW TABLES;
```

Anda seharusnya melihat tabel-tabel berikut:

**Tabel Lama:**
- ✅ activities
- ✅ activity_attempts
- ✅ materials
- ✅ modules
- ✅ questions
- ✅ student_progress
- ✅ task_submissions
- ✅ units
- ✅ users

**Tabel Baru:**
- ✅ **pbl_scenarios** ← BARU
- ✅ **digital_media** ← BARU
- ✅ **transformative_values** ← BARU
- ✅ **transformative_assessments** ← BARU
- ✅ **system_settings** ← BARU
- ✅ **activity_logs** ← BARU

**Total: 15 tabel**

---

## 🔍 CEK DATA DEFAULT

### Cek Nilai Transformatif
```sql
SELECT * FROM transformative_values;
```

Anda seharusnya melihat 5 nilai transformatif:
1. Toleransi Beragama
2. Moderasi Beragama
3. Integritas Akademik
4. Kepedulian Sosial
5. Refleksi Diri

### Cek Pengaturan Sistem
```sql
SELECT * FROM system_settings;
```

Anda seharusnya melihat 5 pengaturan:
1. siteName
2. siteDescription
3. theme
4. enableRegistration
5. maintenanceMode

---

## 🔧 TROUBLESHOOTING

### Error: "Table already exists"
**Solusi:** Ini normal! Script menggunakan `CREATE TABLE IF NOT EXISTS`, jadi aman dijalankan berkali-kali.

### Error: "Cannot add foreign key constraint"
**Solusi:** Pastikan tabel `users` sudah ada. Jalankan schema dasar terlebih dahulu:
```bash
mysql -u root -p emodul_pai < sql/schema-mysql.sql
```

### Error: "Column 'graded_at' already exists"
**Solusi:** Ini normal! Kolom sudah ada, skip saja error ini.

### Error: "Duplicate entry"
**Solusi:** Data default sudah ada. Script menggunakan `ON DUPLICATE KEY UPDATE`, jadi aman.

---

## 📝 CATATAN PENTING

1. **Backup Database Terlebih Dahulu**
   ```bash
   mysqldump -u root -p emodul_pai > backup_emodul_pai.sql
   ```

2. **Script Aman Dijalankan Berkali-kali**
   - Menggunakan `IF NOT EXISTS`
   - Menggunakan `ON DUPLICATE KEY UPDATE`
   - Tidak akan menghapus data yang sudah ada

3. **Tidak Akan Menghapus Data Lama**
   - Hanya menambahkan tabel baru
   - Hanya menambahkan kolom baru
   - Data lama tetap aman

---

## ✅ CHECKLIST UPDATE DATABASE

- [ ] Backup database (opsional tapi recommended)
- [ ] Jalankan script `UPDATE_DATABASE_LENGKAP.sql`
- [ ] Verifikasi semua tabel sudah ada (15 tabel)
- [ ] Cek data default nilai transformatif (5 data)
- [ ] Cek data default pengaturan sistem (5 data)
- [ ] Test aplikasi dengan `npm run dev`

---

## 🎉 SELESAI!

Setelah menjalankan script ini, database Anda sudah siap untuk semua fitur baru!

**Next Step:** Jalankan aplikasi dengan `npm run dev` dan test semua fitur baru!

---

**Jika ada masalah, periksa error message dan lihat bagian Troubleshooting di atas.**
