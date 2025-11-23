-- Schema MySQL untuk E-Modul Interaktif PAI
-- Jalankan file ini di database MySQL (misalnya `emodul_pai`) melalui TablePlus.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT','LECTURER','ADMIN') NOT NULL,
  institution VARCHAR(255),
  semester VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  learning_outcomes TEXT,
  ordering INT,
  is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ordering INT,
  CONSTRAINT fk_units_module FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  unit_id INT NOT NULL,
  status VARCHAR(50),
  completion_percentage DOUBLE DEFAULT 0,
  last_accessed_at DATETIME,
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_progress_unit FOREIGN KEY (unit_id) REFERENCES units(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  media_type VARCHAR(50),
  media_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_materials_unit FOREIGN KEY (unit_id) REFERENCES units(id)
    ON DELETE CASCADE
);

-- Tabel-tabel lain (PBL, aktivitas, glosarium, dll.) bisa ditambahkan kemudian.
