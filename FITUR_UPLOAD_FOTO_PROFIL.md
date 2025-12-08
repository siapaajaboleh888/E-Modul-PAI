# Update: Fitur Upload Foto Profil dan Navigasi

## Perubahan yang Dilakukan

### 1. **Tombol "Kembali ke Dashboard"**
Telah ditambahkan tombol navigasi "Kembali ke Dashboard" pada halaman-halaman berikut:
- ✅ `/student/modules` - Halaman daftar modul (sudah ada sebelumnya)
- ✅ `/student/modules/:id` - Halaman detail modul (baru ditambahkan)
- ✅ `/student/profile` - Halaman profil (sudah ada sebelumnya)

### 2. **Fitur Upload Foto Profil**
Mahasiswa sekarang dapat mengupload foto profil mereka sendiri dengan fitur:
- 📸 **Upload Foto**: Klik tombol kamera pada foto profil untuk memilih gambar
- 👁️ **Preview Langsung**: Foto akan langsung ditampilkan sebelum diupload
- ✅ **Validasi File**: 
  - Hanya menerima file gambar (JPEG, PNG, GIF)
  - Maksimal ukuran file: 5MB
- 🔄 **Auto-Replace**: Foto lama otomatis terhapus saat upload foto baru
- 💾 **Penyimpanan**: Foto disimpan di folder `public/uploads/profiles/`

### 3. **Fitur Update Profil**
Mahasiswa dapat mengupdate informasi profil mereka:
- Nama Lengkap
- Email
- Institusi
- Semester

### 4. **Fitur Ubah Password**
Mahasiswa dapat mengubah password mereka dengan:
- Verifikasi password lama
- Konfirmasi password baru
- Enkripsi password menggunakan bcrypt

## Instalasi

### 1. Install Dependencies
```bash
npm install multer
```

### 2. Update Database
Jalankan script SQL berikut di database MySQL Anda:
```bash
# Melalui TablePlus atau MySQL client
# Jalankan file: sql/UPDATE_ADD_PROFILE_PHOTO.sql
```

Atau jalankan query berikut secara manual:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500) DEFAULT NULL AFTER semester;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status;
```

### 3. Buat Folder Upload
Folder akan otomatis dibuat saat pertama kali ada upload, tapi Anda juga bisa membuatnya manual:
```bash
mkdir -p public/uploads/profiles
```

## Cara Menggunakan

### Upload Foto Profil:
1. Login sebagai mahasiswa
2. Buka halaman **Profil Saya** dari menu navigasi
3. Klik tombol **kamera** di pojok kanan bawah foto profil
4. Pilih file gambar dari komputer Anda
5. Foto akan langsung diupload dan ditampilkan

### Update Informasi Profil:
1. Buka halaman **Profil Saya**
2. Edit informasi yang ingin diubah
3. Klik tombol **Simpan Perubahan**

### Ubah Password:
1. Buka halaman **Profil Saya**
2. Scroll ke bagian **Ubah Password**
3. Masukkan password lama, password baru, dan konfirmasi
4. Klik tombol **Ubah Password**

## File yang Dimodifikasi

1. **`src/routes/student.js`**
   - Menambahkan konfigurasi multer untuk upload foto
   - Route POST `/student/profile` untuk update profil
   - Route POST `/student/profile/upload-photo` untuk upload foto
   - Route POST `/student/profile/change-password` untuk ubah password

2. **`views/student/profile/index.ejs`**
   - Menambahkan UI untuk upload foto profil
   - Menambahkan preview foto profil
   - Menambahkan JavaScript untuk validasi dan preview

3. **`views/student/modules/show.ejs`**
   - Menambahkan header dengan gradient
   - Menambahkan tombol "Kembali ke Modul"

4. **`package.json`**
   - Menambahkan dependency `multer`

5. **`sql/UPDATE_ADD_PROFILE_PHOTO.sql`** (baru)
   - Script SQL untuk menambahkan kolom `profile_photo` dan `created_at`

## Keamanan

- ✅ File upload dibatasi hanya untuk gambar (JPEG, PNG, GIF)
- ✅ Ukuran file maksimal 5MB
- ✅ Nama file di-hash untuk menghindari konflik
- ✅ Foto lama otomatis dihapus saat upload foto baru
- ✅ Password di-hash menggunakan bcrypt
- ✅ Validasi password lama sebelum mengubah password

## Troubleshooting

### Foto tidak muncul setelah upload:
- Pastikan folder `public/uploads/profiles` ada dan memiliki permission yang benar
- Periksa console browser untuk error
- Pastikan kolom `profile_photo` sudah ada di database

### Error saat upload:
- Pastikan file adalah gambar (JPEG, PNG, GIF)
- Pastikan ukuran file tidak lebih dari 5MB
- Periksa log server untuk error detail

### Password tidak bisa diubah:
- Pastikan password lama yang dimasukkan benar
- Pastikan password baru dan konfirmasi cocok
- Periksa console server untuk error

## Catatan

- Foto profil disimpan di `public/uploads/profiles/` dengan format nama: `profile-{userId}-{timestamp}-{random}.{ext}`
- Foto profil akan ditampilkan di halaman profil dan bisa digunakan di halaman lain dengan mengakses `currentUser.profile_photo`
- Jika user belum upload foto, akan ditampilkan icon default
