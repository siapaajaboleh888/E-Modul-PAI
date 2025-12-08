-- Schema tambahan untuk fitur-fitur baru E-Modul Interaktif PAI
-- Jalankan file ini setelah schema-mysql.sql dan schema-activities-mysql.sql

-- Tabel untuk Skenario PBL
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
);

-- Tabel untuk Media Digital
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
);

-- Tabel untuk Nilai Transformatif
CREATE TABLE IF NOT EXISTS transformative_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value_name VARCHAR(255) NOT NULL,
  description TEXT,
  indicators TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk Penilaian Nilai Transformatif per Mahasiswa
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
);

-- Tabel untuk Pengaturan Sistem
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk Log Aktivitas
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

-- Tambahkan kolom graded_at ke task_submissions jika belum ada
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS graded_at DATETIME;

-- Insert beberapa nilai transformatif default
INSERT INTO transformative_values (value_name, description, indicators) VALUES
('Toleransi Beragama', 'Kemampuan menghargai dan menghormati perbedaan keyakinan', 'Menunjukkan sikap terbuka terhadap perbedaan, Tidak diskriminatif, Aktif dalam dialog antar agama'),
('Moderasi Beragama', 'Pemahaman dan praktik beragama yang seimbang dan moderat', 'Menghindari ekstremisme, Menerapkan nilai-nilai Islam rahmatan lil alamin, Bersikap adil dan bijaksana'),
('Integritas Akademik', 'Kejujuran dan tanggung jawab dalam pembelajaran', 'Tidak menyontek, Mengerjakan tugas sendiri, Menghargai karya orang lain'),
('Kepedulian Sosial', 'Kesadaran dan aksi nyata untuk membantu sesama', 'Aktif dalam kegiatan sosial, Empati terhadap sesama, Berkontribusi untuk masyarakat'),
('Refleksi Diri', 'Kemampuan introspeksi dan evaluasi diri', 'Menulis refleksi berkala, Mengevaluasi perkembangan diri, Menetapkan target perbaikan');

-- Insert pengaturan sistem default
INSERT INTO system_settings (setting_key, setting_value) VALUES
('siteName', 'E-Modul PAI'),
('siteDescription', 'Pembelajaran PAI di Perguruan Tinggi'),
('theme', 'light'),
('enableRegistration', '1'),
('maintenanceMode', '0')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
