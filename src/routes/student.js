const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload foto profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan!'));
  }
});

function requireStudent(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'STUDENT') {
    return res.redirect('/login');
  }
  next();
}

router.use(requireStudent);

router.get('/dashboard', async (req, res) => {
  const userId = req.session.user.id;
  const dashboardData = await db.getStudentDashboard(userId);
  res.render('student/dashboard', { dashboard: dashboardData });
});

// Peta Kompetensi (Capaian Pembelajaran) modul utama
router.get('/competency-map', (req, res) => {
  res.render('student/competency_map');
});

// Halaman informasi Skenario PBL
router.get('/pbl', (req, res) => {
  res.render('student/pbl_overview');
});

// Halaman informasi Aktivitas Interaktif
router.get('/activities/overview', (req, res) => {
  res.render('student/activities_overview');
});

// Halaman Glosarium (masih statis sederhana)
router.get('/glossary', (req, res) => {
  res.render('student/glossary/index');
});

// ========== MEDIA DIGITAL ==========
// Halaman untuk melihat semua media digital
router.get('/media', async (req, res) => {
  try {
    const media = await db.query('SELECT * FROM digital_media ORDER BY uploaded_at DESC');
    res.render('student/media/index', { media });
  } catch (err) {
    console.error('Get media error:', err);
    res.redirect('/student/dashboard');
  }
});

// Detail media
router.get('/media/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await db.queryOne('SELECT * FROM digital_media WHERE id = ?', [mediaId]);
    if (!media) {
      return res.redirect('/student/media');
    }
    res.render('student/media/show', { media });
  } catch (err) {
    console.error('Get media detail error:', err);
    res.redirect('/student/media');
  }
});

// Halaman Pengaturan / Profil
router.get('/profile', (req, res) => {
  const success = req.query.success || undefined;
  const error = req.query.error || undefined;
  res.render('student/profile/index', { success, error });
});

// Update profil mahasiswa
router.post('/profile', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { name, email, institution, semester } = req.body;

    await db.query(
      'UPDATE users SET name = ?, email = ?, institution = ?, semester = ? WHERE id = ?',
      [name, email, institution || null, semester || null, userId]
    );

    // Update session
    req.session.user.name = name;
    req.session.user.email = email;
    req.session.user.institution = institution;
    req.session.user.semester = semester;

    res.render('student/profile/index', { success: 'Profil berhasil diperbarui!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.render('student/profile/index', { error: 'Gagal memperbarui profil.' });
  }
});

// Upload foto profil
router.post('/profile/upload-photo', upload.single('profile_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/student/profile?error=' + encodeURIComponent('Tidak ada file yang diupload.'));
    }

    const userId = req.session.user.id;
    const photoPath = '/uploads/profiles/' + req.file.filename;

    // Hapus foto lama jika ada
    const oldUser = await db.queryOne('SELECT profile_photo FROM users WHERE id = ?', [userId]);
    if (oldUser && oldUser.profile_photo) {
      const oldPhotoPath = path.join(__dirname, '../../public', oldUser.profile_photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update database
    await db.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoPath, userId]);

    // Update session
    req.session.user.profile_photo = photoPath;

    res.redirect('/student/profile?success=' + encodeURIComponent('Foto profil berhasil diperbarui!'));
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.redirect('/student/profile?error=' + encodeURIComponent('Gagal mengupload foto profil: ' + error.message));
  }
});

// Ubah password
router.post('/profile/change-password', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.redirect('/student/profile?error=' + encodeURIComponent('Password baru dan konfirmasi tidak cocok.'));
    }

    // Verifikasi password lama
    const user = await db.queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.redirect('/student/profile?error=' + encodeURIComponent('Password lama tidak sesuai.'));
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    res.redirect('/student/profile?success=' + encodeURIComponent('Password berhasil diubah!'));
  } catch (error) {
    console.error('Error changing password:', error);
    res.redirect('/student/profile?error=' + encodeURIComponent('Gagal mengubah password: ' + error.message));
  }
});

router.get('/modules', async (req, res) => {
  const modules = await db.getAllModules();
  res.render('student/modules/index', { modules });
});

router.get('/modules/:id', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/student/modules');
  const units = await db.getUnitsByModule(moduleId);
  res.render('student/modules/show', { module: moduleData, units });
});

router.get('/units/:unitId', async (req, res) => {
  const unitId = req.params.unitId;
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [unitId]);
  if (!unitRow) return res.redirect('/student/modules');
  const materials = await db.getMaterialsByUnit(unitId);
  res.render('student/units/show', { unit: unitRow, materials });
});

// Daftar aktivitas (kuis/tugas) untuk satu unit
router.get('/units/:unitId/activities', async (req, res) => {
  const unitId = req.params.unitId;
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [unitId]);
  if (!unitRow) return res.redirect('/student/modules');
  const activities = await db.getActivitiesByUnit(unitId);

  // Tandai aktivitas yang sudah dikerjakan (kuis/tugas) oleh mahasiswa ini
  const studentId = req.session.user.id;
  const doneMap = {};
  for (const a of activities) {
    if (a.type === 'QUIZ') {
      const attempt = await db.getLastActivityAttempt(a.id, studentId);
      if (attempt) doneMap[a.id] = true;
    } else if (a.type === 'TASK') {
      const sub = await db.getLastTaskSubmission(a.id, studentId);
      if (sub) doneMap[a.id] = true;
    }
  }

  res.render('student/activities/index', { unit: unitRow, activities, doneMap });
});

// Kerjakan kuis
router.get('/activities/:id/quiz', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'QUIZ') {
    return res.redirect('/student/dashboard');
  }
  const studentId = req.session.user.id;
  const existingAttempt = await db.getLastActivityAttempt(id, studentId);
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [activity.unit_id]);
  const questions = await db.getQuestionsByActivity(id);
  if (!questions || !questions.length) {
    return res.render('student/activities/quiz', { activity, unit: unitRow, questions: [], error: 'Belum ada soal untuk kuis ini.' });
  }
  // Jika sudah pernah mengerjakan, langsung tampilkan hasil terakhir (tanpa form)
  if (existingAttempt) {
    // Hitung kembali jumlah benar dari jawaban tersimpan
    let correct = 0;
    let total = questions.length;
    let answers = {};
    try {
      answers = existingAttempt.answers_json ? JSON.parse(existingAttempt.answers_json) : {};
    } catch (e) {
      answers = {};
    }
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans && ans === q.answer_key) correct += 1;
    });
    const score = existingAttempt.score;
    return res.render('student/activities/quiz_result', {
      activity,
      unit: unitRow,
      total,
      correct,
      score
    });
  }

  res.render('student/activities/quiz', { activity, unit: unitRow, questions, error: null });
});

router.post('/activities/:id/quiz', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'QUIZ') {
    return res.redirect('/student/dashboard');
  }
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [activity.unit_id]);
  const questions = await db.getQuestionsByActivity(id);
  if (!questions || !questions.length) {
    return res.render('student/activities/quiz', { activity, unit: unitRow, questions: [], error: 'Belum ada soal untuk kuis ini.' });
  }

  // Hitung skor
  let correct = 0;
  const answers = {};
  questions.forEach((q) => {
    const key = 'q_' + q.id;
    const ans = req.body[key];
    answers[q.id] = ans || '';
    if (ans && ans === q.answer_key) {
      correct += 1;
    }
  });
  const total = questions.length;
  const maxScore = activity.max_score || total;
  const score = total > 0 ? Math.round((correct / total) * maxScore) : 0;

  await db.createActivityAttempt({
    activity_id: id,
    student_id: req.session.user.id,
    score,
    answers_json: JSON.stringify(answers)
  });

  // Update progres unit: tandai selesai
  await db.upsertStudentProgressCompletion(req.session.user.id, activity.unit_id, 'COMPLETED', 100);

  res.render('student/activities/quiz_result', {
    activity,
    unit: unitRow,
    total,
    correct,
    score
  });
});

// Kerjakan tugas (TASK)
router.get('/activities/:id/task', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'TASK') {
    return res.redirect('/student/dashboard');
  }
  const unitRow = await db.queryOne(
    'SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?',
    [activity.unit_id]
  );
  res.render('student/activities/task', { activity, unit: unitRow, error: null });
});

router.post('/activities/:id/task', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'TASK') {
    return res.redirect('/student/dashboard');
  }
  const unitRow = await db.queryOne(
    'SELECT u.*, m.title as module_title FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?',
    [activity.unit_id]
  );
  const { answer_text } = req.body;
  if (!answer_text || !answer_text.trim()) {
    return res.status(400).render('student/activities/task', {
      activity,
      unit: unitRow,
      error: 'Jawaban tugas tidak boleh kosong.'
    });
  }

  await db.createTaskSubmission({
    activity_id: id,
    student_id: req.session.user.id,
    answer_text: answer_text.trim(),
    attachment_url: null
  });

  // Update progres unit: tandai selesai (untuk saat ini, satu tugas cukup untuk menandai selesai)
  await db.upsertStudentProgressCompletion(req.session.user.id, activity.unit_id, 'COMPLETED', 100);

  res.render('student/activities/task_submitted', {
    activity,
    unit: unitRow
  });
});

// ========== PENILAIAN REFLEKSI & TUGAS ==========
router.get('/assessments', async (req, res) => {
  const studentId = req.session.user.id;

  // Ambil semua submission tugas dengan nilai
  const taskSubmissions = await db.query(
    `SELECT ts.*, a.title as activity_title, a.max_score, u.title as unit_title, m.title as module_title
     FROM task_submissions ts
     JOIN activities a ON ts.activity_id = a.id
     JOIN units u ON a.unit_id = u.id
     JOIN modules m ON u.module_id = m.id
     WHERE ts.student_id = ?
     ORDER BY ts.submitted_at DESC`,
    [studentId]
  );

  // Ambil semua quiz attempts dengan nilai
  const quizAttempts = await db.query(
    `SELECT aa.*, a.title as activity_title, a.max_score, u.title as unit_title, m.title as module_title
     FROM activity_attempts aa
     JOIN activities a ON aa.activity_id = a.id
     JOIN units u ON a.unit_id = u.id
     JOIN modules m ON u.module_id = m.id
     WHERE aa.student_id = ?
     ORDER BY aa.submitted_at DESC`,
    [studentId]
  );

  res.render('student/assessments/index', { taskSubmissions, quizAttempts });
});

// ========== LAPORAN AKHIR PROGRES ==========
router.get('/progress-report', async (req, res) => {
  const studentId = req.session.user.id;

  // Statistik keseluruhan
  const totalModules = await db.queryOne('SELECT COUNT(*) as count FROM modules WHERE is_active = 1');
  const completedModules = await db.queryOne(
    `SELECT COUNT(DISTINCT m.id) as count 
     FROM modules m
     JOIN units u ON m.id = u.module_id
     JOIN student_progress sp ON u.id = sp.unit_id
     WHERE sp.student_id = ? AND sp.status = 'COMPLETED'`,
    [studentId]
  );

  const totalActivities = await db.queryOne('SELECT COUNT(*) as count FROM activities');
  const completedActivities = await db.queryOne(
    `SELECT COUNT(DISTINCT activity_id) as count 
     FROM (
       SELECT activity_id FROM task_submissions WHERE student_id = ?
       UNION
       SELECT activity_id FROM activity_attempts WHERE student_id = ?
     ) as completed`,
    [studentId, studentId]
  );

  // Rata-rata nilai
  const avgTaskScore = await db.queryOne(
    'SELECT AVG(score) as avg FROM task_submissions WHERE student_id = ? AND score IS NOT NULL',
    [studentId]
  );
  const avgQuizScore = await db.queryOne(
    'SELECT AVG(score) as avg FROM activity_attempts WHERE student_id = ?',
    [studentId]
  );

  // Progres per modul
  const moduleProgress = await db.query(
    `SELECT m.title as module_title, 
     COUNT(DISTINCT u.id) as total_units,
     COUNT(DISTINCT CASE WHEN sp.status = 'COMPLETED' THEN sp.unit_id END) as completed_units
     FROM modules m
     LEFT JOIN units u ON m.id = u.module_id
     LEFT JOIN student_progress sp ON u.id = sp.unit_id AND sp.student_id = ?
     WHERE m.is_active = 1
     GROUP BY m.id
     ORDER BY m.ordering`,
    [studentId]
  );

  // Ambil progres detail per unit
  const progress = await db.query(
    'SELECT * FROM student_progress WHERE student_id = ? ORDER BY unit_id',
    [studentId]
  );

  res.render('student/progress_report/index', {
    stats: {
      totalModules: totalModules.count,
      completedModules: completedModules.count || 0,
      totalActivities: totalActivities.count,
      completedActivities: completedActivities.count || 0,
      avgTaskScore: avgTaskScore.avg || 0,
      avgQuizScore: avgQuizScore.avg || 0
    },
    moduleProgress,
    progress
  });
});

module.exports = router;
