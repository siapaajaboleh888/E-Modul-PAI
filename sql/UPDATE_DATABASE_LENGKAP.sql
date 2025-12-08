-- =====================================================
-- UPDATE DATABASE E-MODUL PAI - LENGKAP
-- =====================================================
-- File ini berisi semua perintah SQL untuk mengupdate
-- database Anda dengan tabel-tabel baru yang diperlukan
-- =====================================================

-- Gunakan database emodul_pai
USE emodul_pai;

-- =====================================================
-- 1. TABEL SKENARIO PBL
-- =====================================================
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

-- =====================================================
-- 2. TABEL MEDIA DIGITAL
-- =====================================================
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

-- =====================================================
-- 3. TABEL NILAI TRANSFORMATIF
-- =====================================================
CREATE TABLE IF NOT EXISTS transformative_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value_name VARCHAR(255) NOT NULL,
  description TEXT,
  indicators TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABEL PENILAIAN NILAI TRANSFORMATIF
-- =====================================================
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

-- =====================================================
-- 5. TABEL PENGATURAN SISTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABEL LOG AKTIVITAS
-- =====================================================
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

-- =====================================================
-- 7. UPDATE TABEL TASK_SUBMISSIONS
-- =====================================================
-- Tambahkan kolom graded_at jika belum ada
SET @dbname = DATABASE();
SET @tablename = 'task_submissions';
SET @columnname = 'graded_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- 8. INSERT DATA DEFAULT NILAI TRANSFORMATIF
-- =====================================================
INSERT INTO transformative_values (value_name, description, indicators) VALUES
('Toleransi Beragama', 'Kemampuan menghargai dan menghormati perbedaan keyakinan', 'Menunjukkan sikap terbuka terhadap perbedaan, Tidak diskriminatif, Aktif dalam dialog antar agama'),
('Moderasi Beragama', 'Pemahaman dan praktik beragama yang seimbang dan moderat', 'Menghindari ekstremisme, Menerapkan nilai-nilai Islam rahmatan lil alamin, Bersikap adil dan bijaksana'),
('Integritas Akademik', 'Kejujuran dan tanggung jawab dalam pembelajaran', 'Tidak menyontek, Mengerjakan tugas sendiri, Menghargai karya orang lain'),
('Kepedulian Sosial', 'Kesadaran dan aksi nyata untuk membantu sesama', 'Aktif dalam kegiatan sosial, Empati terhadap sesama, Berkontribusi untuk masyarakat'),
('Refleksi Diri', 'Kemampuan introspeksi dan evaluasi diri', 'Menulis refleksi berkala, Mengevaluasi perkembangan diri, Menetapkan target perbaikan')
ON DUPLICATE KEY UPDATE value_name = VALUES(value_name);

-- =====================================================
-- 9. INSERT DATA DEFAULT PENGATURAN SISTEM
-- =====================================================
INSERT INTO system_settings (setting_key, setting_value) VALUES
('siteName', 'E-Modul PAI'),
('siteDescription', 'Pembelajaran PAI di Perguruan Tinggi'),
('theme', 'light'),
('enableRegistration', '1'),
('maintenanceMode', '0')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- =====================================================
-- 10. VERIFIKASI TABEL
-- =====================================================
-- Tampilkan semua tabel yang ada
SHOW TABLES;

-- =====================================================
-- SELESAI!
-- =====================================================
-- Database Anda sekarang sudah terupdate dengan:
-- - 6 tabel baru
-- - 1 kolom baru di task_submissions
-- - Data default untuk nilai transformatif
-- - Data default untuk pengaturan sistem
-- =====================================================
