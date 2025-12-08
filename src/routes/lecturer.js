const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload media
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx|ppt|pptx/;
    const mimetype = allowedTypes.test(file.mimetype) || true; // Allow all for now
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tipe file tidak didukung!'));
  }
});

// Middleware khusus dosen
function requireLecturer(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'LECTURER') {
    return res.redirect('/login');
  }
  next();
}

router.use(requireLecturer);

// Dashboard dosen: gunakan statistik yang sama dengan admin, tapi dengan tampilan khusus dosen
router.get('/dashboard', async (req, res) => {
  const stats = await db.getAdminDashboard();
  res.render('lecturer/dashboard', { stats });
});

// ========== MANAJEMEN MODUL & MATERI ==========
router.get('/modules', async (req, res) => {
  const modules = await db.getAllModules();
  res.render('lecturer/modules/index', { modules });
});

router.get('/modules/:id', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/lecturer/modules');
  const units = await db.getUnitsByModule(moduleId);
  res.render('lecturer/modules/show', { module: moduleData, units });
});

// Upload materi digital (video/animasi)
router.get('/modules/:id/upload-material', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/lecturer/modules');
  res.render('lecturer/modules/upload_material', { module: moduleData });
});

// Lihat detail unit
router.get('/units/:id', async (req, res) => {
  const unitId = req.params.id;
  const unitRow = await db.queryOne('SELECT u.*, m.title as module_title, m.id as module_id FROM units u JOIN modules m ON u.module_id = m.id WHERE u.id = ?', [unitId]);
  if (!unitRow) return res.redirect('/lecturer/modules');
  const materials = await db.getMaterialsByUnit(unitId);
  const activities = await db.getActivitiesByUnit(unitId);
  res.render('lecturer/units/show', { unit: unitRow, materials, activities });
});

// ========== MANAJEMEN SKENARIO PBL ==========
router.get('/pbl-scenarios', async (req, res) => {
  // Ambil semua skenario PBL dari database
  const scenarios = await db.query('SELECT * FROM pbl_scenarios ORDER BY created_at DESC');
  res.render('lecturer/pbl_scenarios/index', { scenarios });
});

router.get('/pbl-scenarios/new', (req, res) => {
  res.render('lecturer/pbl_scenarios/new', { error: null });
});

router.post('/pbl-scenarios', async (req, res) => {
  const { title, description, learning_objectives, problem_statement } = req.body;
  try {
    await db.query(
      'INSERT INTO pbl_scenarios (title, description, learning_objectives, problem_statement, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, learning_objectives, problem_statement, req.session.user.id]
    );
    res.redirect('/lecturer/pbl-scenarios');
  } catch (err) {
    console.error('Create PBL scenario error:', err);
    res.status(400).render('lecturer/pbl_scenarios/new', { error: 'Gagal menyimpan skenario PBL.' });
  }
});

router.get('/pbl-scenarios/:id/edit', async (req, res) => {
  const id = req.params.id;
  const scenario = await db.queryOne('SELECT * FROM pbl_scenarios WHERE id = ?', [id]);
  if (!scenario) return res.redirect('/lecturer/pbl-scenarios');
  res.render('lecturer/pbl_scenarios/edit', { scenario, error: null });
});

router.put('/pbl-scenarios/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, learning_objectives, problem_statement } = req.body;
  try {
    await db.query(
      'UPDATE pbl_scenarios SET title = ?, description = ?, learning_objectives = ?, problem_statement = ? WHERE id = ?',
      [title, description, learning_objectives, problem_statement, id]
    );
    res.redirect('/lecturer/pbl-scenarios');
  } catch (err) {
    console.error('Update PBL scenario error:', err);
    const scenario = await db.queryOne('SELECT * FROM pbl_scenarios WHERE id = ?', [id]);
    res.status(400).render('lecturer/pbl_scenarios/edit', { scenario, error: 'Gagal memperbarui skenario PBL.' });
  }
});

// ========== MANAJEMEN MEDIA DIGITAL ==========
router.get('/media', async (req, res) => {
  // Ambil semua media digital dari database
  const media = await db.query('SELECT * FROM digital_media ORDER BY uploaded_at DESC');
  res.render('lecturer/media/index', { media });
});

router.get('/media/upload', (req, res) => {
  res.render('lecturer/media/upload', { error: null });
});

router.post('/media/upload', uploadMedia.single('media_file'), async (req, res) => {
  const { title, media_type, media_url, description, upload_method } = req.body;
  try {
    let finalMediaUrl = media_url;

    // Jika upload file
    if (upload_method === 'file' && req.file) {
      finalMediaUrl = '/uploads/media/' + req.file.filename;
    }

    if (!finalMediaUrl) {
      return res.status(400).render('lecturer/media/upload', { error: 'URL media atau file harus diisi.' });
    }

    await db.query(
      'INSERT INTO digital_media (title, media_type, media_url, description, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [title, media_type, finalMediaUrl, description, req.session.user.id]
    );
    res.redirect('/lecturer/media');
  } catch (err) {
    console.error('Upload media error:', err);
    res.status(400).render('lecturer/media/upload', { error: 'Gagal mengupload media: ' + err.message });
  }
});

// ========== PENILAIAN REFLEKSI & TUGAS ==========
router.get('/assessments', async (req, res) => {
  // Ambil semua tugas yang perlu dinilai
  const submissions = await db.query(
    `SELECT ts.*, a.title as activity_title, u.name as student_name, u.email as student_email 
     FROM task_submissions ts 
     JOIN activities a ON ts.activity_id = a.id 
     JOIN users u ON ts.student_id = u.id 
     WHERE ts.feedback IS NULL OR ts.feedback = ''
     ORDER BY ts.submitted_at DESC`
  );
  res.render('lecturer/assessments/index', { submissions });
});

router.get('/assessments/:id/grade', async (req, res) => {
  const id = req.params.id;
  const submission = await db.queryOne(
    `SELECT ts.*, a.title as activity_title, a.max_score, u.name as student_name, u.email as student_email 
     FROM task_submissions ts 
     JOIN activities a ON ts.activity_id = a.id 
     JOIN users u ON ts.student_id = u.id 
     WHERE ts.id = ?`,
    [id]
  );
  if (!submission) return res.redirect('/lecturer/assessments');
  res.render('lecturer/assessments/grade', { submission, error: null });
});

router.post('/assessments/:id/grade', async (req, res) => {
  const id = req.params.id;
  const { score, feedback } = req.body;
  try {
    await db.query(
      'UPDATE task_submissions SET score = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
      [score, feedback, id]
    );
    res.redirect('/lecturer/assessments');
  } catch (err) {
    console.error('Grade submission error:', err);
    const submission = await db.queryOne(
      `SELECT ts.*, a.title as activity_title, a.max_score, u.name as student_name, u.email as student_email 
       FROM task_submissions ts 
       JOIN activities a ON ts.activity_id = a.id 
       JOIN users u ON ts.student_id = u.id 
       WHERE ts.id = ?`,
      [id]
    );
    res.status(400).render('lecturer/assessments/grade', { submission, error: 'Gagal menyimpan penilaian.' });
  }
});

// ========== LAPORAN & ANALISIS KELAS ==========
router.get('/reports', async (req, res) => {
  // Statistik kelas
  const totalStudents = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE role = "STUDENT"');
  const totalActivities = await db.queryOne('SELECT COUNT(*) as count FROM activities');
  const totalSubmissions = await db.queryOne('SELECT COUNT(*) as count FROM task_submissions');
  const avgScore = await db.queryOne('SELECT AVG(score) as avg FROM task_submissions WHERE score IS NOT NULL');

  // Progres per mahasiswa
  const studentProgress = await db.query(
    `SELECT u.id, u.name, u.email, 
     COUNT(DISTINCT ts.activity_id) as completed_tasks,
     AVG(ts.score) as avg_score
     FROM users u
     LEFT JOIN task_submissions ts ON u.id = ts.student_id
     WHERE u.role = 'STUDENT'
     GROUP BY u.id, u.name, u.email
     ORDER BY avg_score DESC`
  );

  res.render('lecturer/reports/index', {
    stats: {
      totalStudents: totalStudents.count,
      totalActivities: totalActivities.count,
      totalSubmissions: totalSubmissions.count,
      avgScore: avgScore.avg || 0
    },
    studentProgress
  });
});

// Detail progres per mahasiswa
router.get('/reports/student/:id', async (req, res) => {
  const studentId = req.params.id;
  const student = await db.getUserById(studentId);
  if (!student || student.role !== 'STUDENT') {
    return res.redirect('/lecturer/reports');
  }

  const submissions = await db.query(
    `SELECT ts.*, a.title as activity_title, a.max_score
     FROM task_submissions ts
     JOIN activities a ON ts.activity_id = a.id
     WHERE ts.student_id = ?
     ORDER BY ts.submitted_at DESC`,
    [studentId]
  );

  const quizAttempts = await db.query(
    `SELECT aa.*, a.title as activity_title, a.max_score
     FROM activity_attempts aa
     JOIN activities a ON aa.activity_id = a.id
     WHERE aa.student_id = ?
     ORDER BY aa.submitted_at DESC`,
    [studentId]
  );

  res.render('lecturer/reports/student_detail', { student, submissions, quizAttempts });
});

// ========== MANAJEMEN PENGGUNA (DOSEN) ==========
router.get('/users', async (req, res) => {
  const students = await db.query('SELECT * FROM users WHERE role = "STUDENT" ORDER BY name');
  res.render('lecturer/users/index', { students });
});

router.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const user = await db.getUserById(userId);
  if (!user || user.role !== 'STUDENT') {
    return res.redirect('/lecturer/users');
  }
  res.render('lecturer/users/show', { user });
});

module.exports = router;

