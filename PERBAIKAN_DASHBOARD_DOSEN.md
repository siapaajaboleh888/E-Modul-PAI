# Perbaikan Dashboard Dosen - Semua Error 404 Sudah Diperbaiki!

## ✅ Masalah yang Sudah Diperbaiki

### 1. **Gambar 1: Tombol "Kembali ke Dashboard" di Form PBL** ✅
**Masalah:** Tidak ada tombol navigasi kembali ke dashboard
**Solusi:** Menambahkan tombol "Kembali ke Dashboard" di:
- `views/lecturer/pbl_scenarios/new.ejs`
- `views/lecturer/pbl_scenarios/edit.ejs`

**Hasil:**
```html
<a href="/lecturer/dashboard" class="btn btn-outline-secondary">
    <i class="bi bi-arrow-left"></i> Kembali ke Dashboard
</a>
```

---

### 2. **Gambar 2: Error 404 Saat Klik "Lihat" di Modul** ✅
**Masalah:** Route `/lecturer/units/:id` tidak ada
**Solusi:** 
1. Menambahkan route baru di `src/routes/lecturer.js`:
```javascript
router.get('/units/:id', async (req, res) => {
  const unitId = req.params.id;
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title, m.id as module_id FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [unitId]);
  if (!unitRow) return res.redirect('/lecturer/modules');
  const materials = await db.getMaterialsByUnit(unitId);
  const activities = await db.getActivitiesByUnit(unitId);
  res.render('lecturer/units/show', { unit: unitRow, materials, activities });
});
```

2. Membuat view baru: `views/lecturer/units/show.ejs`
   - Menampilkan detail unit
   - Daftar materi pembelajaran
   - Daftar aktivitas (kuis & tugas)
   - Tombol navigasi ke modul dan dashboard

---

### 3. **Gambar 3: Upload Media - Fitur Upload File & Tombol Dashboard** ✅
**Masalah:** 
- Hanya bisa input URL, tidak bisa upload file
- Tidak ada tombol kembali ke dashboard

**Solusi:**
1. **Menambahkan fitur upload file** dengan multer:
   - Konfigurasi multer di `src/routes/lecturer.js`
   - Support upload file hingga 50MB
   - File disimpan di `public/uploads/media/`
   - Support berbagai format: gambar, video, audio, dokumen

2. **Update form upload** di `views/lecturer/media/upload.ejs`:
   - Toggle antara URL dan Upload File
   - Radio button untuk memilih metode
   - Validasi file type dan size
   - Tombol "Kembali ke Dashboard"

3. **Update route POST** untuk handle file upload:
```javascript
router.post('/media/upload', uploadMedia.single('media_file'), async (req, res) => {
  const { title, media_type, media_url, description, upload_method } = req.body;
  let finalMediaUrl = media_url;
  
  if (upload_method === 'file' && req.file) {
    finalMediaUrl = '/uploads/media/' + req.file.filename;
  }
  
  // Save to database...
});
```

**Fitur Upload:**
- ✅ **URL/Link**: Masukkan link YouTube, Google Drive, dll
- ✅ **Upload File**: Upload file langsung dari komputer
- ✅ **Lokasi Penyimpanan**: `public/uploads/media/`
- ✅ **Maksimal Ukuran**: 50MB
- ✅ **Format Support**: 
  - Gambar: JPG, PNG, GIF
  - Video: MP4, AVI, MOV
  - Audio: MP3, WAV
  - Dokumen: PDF, DOC, DOCX, PPT, PPTX

---

### 4. **Gambar 4: Error 404 Saat Klik "Detail" di Laporan** ✅
**Masalah:** Link detail mahasiswa tidak berfungsi
**Solusi:** 
1. Route sudah ada di `src/routes/lecturer.js` (line 231-256)
2. Perbaikan query untuk menambahkan `u.id` di SELECT (sudah diperbaiki sebelumnya)
3. View sudah ada di `views/lecturer/reports/student_detail.ejs`

**Route yang sudah ada:**
```javascript
router.get('/reports/student/:id', async (req, res) => {
  const studentId = req.params.id;
  const student = await db.getUserById(studentId);
  // ... tampilkan detail progres mahasiswa
});
```

---

## 📁 File yang Dibuat/Dimodifikasi

### File Baru:
1. ✅ `views/lecturer/units/show.ejs` - Detail unit pembelajaran
2. ✅ `views/lecturer/pbl_scenarios/new.ejs` - Form PBL (updated)
3. ✅ `views/lecturer/media/upload.ejs` - Form upload media (updated)

### File Dimodifikasi:
1. ✅ `src/routes/lecturer.js`:
   - Menambahkan import multer, path, fs
   - Konfigurasi upload media
   - Route GET `/units/:id`
   - Route POST `/media/upload` (updated)

---

## 🎨 Fitur UI yang Ditambahkan

### 1. **Navigasi yang Konsisten**
- Semua halaman punya tombol "Kembali ke Dashboard"
- Breadcrumb navigation yang jelas
- Icon yang informatif

### 2. **Upload Media yang Fleksibel**
- Toggle antara URL dan Upload File
- Preview lokasi penyimpanan
- Validasi file type dan size
- Error handling yang jelas

### 3. **Detail Unit yang Lengkap**
- Informasi modul dan unit
- Daftar materi pembelajaran
- Daftar aktivitas (kuis & tugas)
- Badge untuk tipe media dan aktivitas

---

## 🧪 Cara Testing

### 1. **Test Navigasi PBL**
1. Login sebagai dosen
2. Klik "Skenario PBL" → "Tambah Skenario Baru"
3. ✅ Lihat tombol "Kembali ke Dashboard" di kanan atas
4. Klik tombol tersebut untuk kembali

### 2. **Test Lihat Unit**
1. Klik "Manajemen Modul"
2. Pilih salah satu modul → Klik "Lihat Detail"
3. Klik "Lihat" pada salah satu unit
4. ✅ Halaman detail unit muncul dengan materi dan aktivitas
5. ✅ Ada tombol "Kembali ke Modul" dan "Dashboard"

### 3. **Test Upload Media**
1. Klik "Media Digital" → "Upload Media Baru"
2. ✅ Lihat tombol "Kembali ke Dashboard"
3. **Test Upload URL:**
   - Pilih "URL/Link"
   - Masukkan link YouTube
   - Klik "Upload"
4. **Test Upload File:**
   - Pilih "Upload File"
   - Pilih file dari komputer
   - ✅ Lihat info lokasi penyimpanan
   - Klik "Upload"
   - File tersimpan di `public/uploads/media/`

### 4. **Test Detail Mahasiswa**
1. Klik "Laporan & Analisis"
2. Klik "Detail" pada salah satu mahasiswa
3. ✅ Halaman detail muncul dengan riwayat tugas dan kuis

---

## 📊 Lokasi Penyimpanan File

```
public/
└── uploads/
    ├── profiles/          # Foto profil mahasiswa
    │   └── profile-*.jpg
    └── media/             # Media pembelajaran (BARU!)
        ├── media-*.mp4    # Video
        ├── media-*.jpg    # Gambar
        ├── media-*.pdf    # Dokumen
        └── ...
```

---

## 🚀 Fitur Tambahan yang Sudah Termasuk

1. ✅ **Auto-create folder** untuk upload
2. ✅ **Unique filename** dengan timestamp
3. ✅ **File validation** (type & size)
4. ✅ **Error handling** yang informatif
5. ✅ **Responsive design** untuk semua ukuran layar
6. ✅ **Icon & badge** yang sesuai dengan tipe konten

---

## 💡 Tips Penggunaan

### Upload Media:
1. **Untuk video YouTube**: Gunakan metode URL/Link
2. **Untuk file lokal**: Gunakan metode Upload File
3. **Untuk file besar**: Pastikan ukuran < 50MB
4. **Untuk Google Drive**: Gunakan URL/Link dengan sharing enabled

### Organisasi Konten:
1. Gunakan nama file yang deskriptif
2. Isi deskripsi dengan lengkap
3. Pilih tipe media yang sesuai
4. Cek preview sebelum menyimpan

---

## ✅ Checklist Perbaikan

- [x] Tombol "Kembali ke Dashboard" di form PBL
- [x] Route `/lecturer/units/:id` untuk detail unit
- [x] View detail unit dengan materi & aktivitas
- [x] Fitur upload file untuk media
- [x] Toggle URL vs Upload File
- [x] Tombol "Kembali ke Dashboard" di upload media
- [x] Konfigurasi multer untuk upload
- [x] Folder `public/uploads/media/`
- [x] Validasi file type dan size
- [x] Error handling yang proper
- [x] Route detail mahasiswa (sudah ada)

---

## 🎉 Selesai!

Semua error 404 sudah diperbaiki dan fitur-fitur baru sudah ditambahkan. Dashboard dosen sekarang sudah lengkap dan siap digunakan!

**Restart server dan test semua fitur!** 🚀
