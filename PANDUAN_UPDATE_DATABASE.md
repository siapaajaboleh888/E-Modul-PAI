# Panduan Update Database untuk Fitur Upload Foto Profil

## Masalah yang Diperbaiki

1. ✅ **Error 404** setelah upload foto - Diperbaiki dengan menggunakan `redirect` instead of `render`
2. ✅ **Error SQL** `IF NOT EXISTS` - Diperbaiki dengan menghapus syntax yang tidak didukung
3. ✅ **Error password** - Diperbaiki dengan menggunakan `password_hash` sesuai schema database

## Langkah-Langkah Update Database

### Opsi 1: Menggunakan TablePlus (Recommended)

1. Buka **TablePlus**
2. Connect ke database `emodul_pai`
3. Klik **SQL** atau tekan `Cmd/Ctrl + E`
4. Copy dan paste query berikut:

```sql
-- Tambahkan kolom profile_photo
ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(500) DEFAULT NULL AFTER semester;

-- Tambahkan kolom created_at
ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status;
```

5. Klik **Run Current** atau tekan `Cmd/Ctrl + R`

### Opsi 2: Menggunakan MySQL Command Line

```bash
mysql -u root -p emodul_pai
```

Kemudian jalankan query:

```sql
USE emodul_pai;

ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(500) DEFAULT NULL AFTER semester;

ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status;
```

### Opsi 3: Jika Kolom Sudah Ada

Jika Anda mendapat error "Duplicate column name", berarti kolom sudah ada. Anda bisa skip langkah ini.

Atau gunakan query ini untuk mengecek:

```sql
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
  AND TABLE_SCHEMA = 'emodul_pai'
  AND COLUMN_NAME IN ('profile_photo', 'created_at');
```

## Verifikasi

Setelah menjalankan query, verifikasi dengan:

```sql
DESCRIBE users;
```

Anda harus melihat kolom baru:
- `profile_photo` VARCHAR(500) NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

## Perubahan Kode yang Sudah Dilakukan

### 1. `src/routes/student.js`
- ✅ Route GET `/student/profile` membaca query parameter
- ✅ Route POST `/profile/upload-photo` menggunakan redirect
- ✅ Route POST `/profile/change-password` menggunakan redirect
- ✅ Menggunakan `password_hash` sesuai schema database

### 2. `views/student/profile/index.ejs`
- ✅ Icon kamera lebih besar (40px) dengan warna kuning
- ✅ Foto profil lebih besar (120px)
- ✅ Text hint ditambahkan
- ✅ Preview ukuran disesuaikan

### 3. `sql/UPDATE_ADD_PROFILE_PHOTO.sql`
- ✅ Query SQL yang kompatibel dengan MySQL versi lama

## Testing

1. **Restart server**:
   ```bash
   npm run dev
   ```

2. **Login sebagai mahasiswa**

3. **Buka halaman Profil Saya**

4. **Test upload foto**:
   - Klik icon kamera kuning
   - Pilih foto (max 5MB, format: JPG, PNG, GIF)
   - Halaman akan refresh dengan pesan sukses
   - Foto akan muncul di kartu profil

5. **Test ubah password**:
   - Masukkan password lama
   - Masukkan password baru
   - Konfirmasi password baru
   - Klik "Ubah Password"
   - Halaman akan refresh dengan pesan sukses

## Troubleshooting

### Error: "Duplicate column name 'profile_photo'"
**Solusi**: Kolom sudah ada, skip langkah ALTER TABLE

### Error: "Unknown column 'password' in 'field list'"
**Solusi**: Sudah diperbaiki, gunakan `password_hash`

### Error 404 setelah upload
**Solusi**: Sudah diperbaiki dengan redirect

### Foto tidak muncul
**Solusi**: 
1. Pastikan folder `public/uploads/profiles` ada
2. Restart server
3. Clear browser cache

### Error: "Cannot read property 'password_hash' of null"
**Solusi**: User tidak ditemukan, pastikan sudah login

## Struktur Folder

```
public/
└── uploads/
    └── profiles/
        ├── profile-1-1234567890-123456789.jpg
        ├── profile-2-1234567891-987654321.png
        └── ...
```

Folder akan otomatis dibuat saat pertama kali upload.

## Keamanan

- ✅ Validasi tipe file (hanya gambar)
- ✅ Validasi ukuran file (max 5MB)
- ✅ Nama file di-hash untuk keamanan
- ✅ Foto lama otomatis dihapus
- ✅ Password di-hash dengan bcrypt
- ✅ Session-based authentication

## Catatan Penting

1. **Nama Kolom**: Database menggunakan `password_hash`, bukan `password`
2. **Redirect**: Semua POST route sekarang menggunakan redirect untuk menghindari 404
3. **Query Parameter**: Success/error message dikirim via query parameter
4. **Foto Path**: Disimpan sebagai `/uploads/profiles/filename.ext`

Selamat mencoba! 🎉
