-- Menambahkan kolom profile_photo ke tabel users
-- Jalankan file ini untuk menambahkan fitur upload foto profil

-- Tambahkan kolom profile_photo jika belum ada
ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(500) DEFAULT NULL AFTER semester;

-- Tambahkan created_at jika belum ada
ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status;

-- Jika kolom sudah ada, query akan error. Itu normal.
-- Atau gunakan query ini untuk mengecek terlebih dahulu:

-- SELECT COLUMN_NAME 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_photo';
