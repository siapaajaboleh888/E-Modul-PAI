const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');
const bcrypt = require('bcryptjs');
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

function requireAdminOrLecturer(req, res, next) {
  if (!req.session.user || (req.session.user.role !== 'LECTURER' && req.session.user.role !== 'ADMIN')) {
    return res.redirect('/login');
  }
  next();
}

function requireAdminOnly(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'ADMIN') {
    return res.redirect('/login');
  }
  next();
}

router.use(requireAdminOrLecturer);

router.get('/dashboard', async (req, res) => {
  const stats = await db.getAdminDashboard();
  res.render('admin/dashboard', { stats });
});

// Overview laporan & analisis sederhana
router.get('/reports/overview', async (req, res) => {
  res.render('admin/reports/overview');
});

// Penilaian Tugas - Menampilkan semua tugas yang perlu dinilai
router.get('/assignments', async (req, res) => {
  try {
    const taskSubmissions = await db.query(`
      SELECT 
        ts.id, ts.answer_text, ts.submitted_at, ts.score, ts.feedback,
        u.name as student_name, u.email as student_email,
        a.id as activity_id, a.title as task_title, a.max_score,
        unit.id as unit_id, unit.title as unit_title,
        mdl.id as module_id, mdl.title as module_title
      FROM task_submissions ts
      JOIN users u ON ts.student_id = u.id
      JOIN activities a ON ts.activity_id = a.id
      JOIN units unit ON a.unit_id = unit.id
      JOIN modules mdl ON unit.module_id = mdl.id
      WHERE a.type = 'TASK'
      ORDER BY ts.submitted_at DESC
    `);
    res.render('admin/assignments/index', { taskSubmissions });
  } catch (err) {
    console.error('Get task submissions error:', err);
    res.redirect('/admin/dashboard');
  }
});

// Nilai tugas individual
router.post('/assignments/:id/grade', async (req, res) => {
  const submissionId = req.params.id;
  const { score, feedback } = req.body;
  try {
    await db.query(
      'UPDATE task_submissions SET score = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
      [score, feedback, submissionId]
    );
    res.redirect('/admin/assignments');
  } catch (err) {
    console.error('Grade task error:', err);
    res.redirect('/admin/assignments');
  }
});

// Manajemen Modul
router.get('/modules', async (req, res) => {
  const modules = await db.getAllModules();
  res.render('admin/modules/index', { modules });
});

router.get('/modules/new', (req, res) => {
  res.render('admin/modules/new');
});

router.post('/modules', async (req, res) => {
  const { title, description, learning_outcomes, ordering } = req.body;
  await db.createModule({ title, description, learning_outcomes, ordering: ordering ? Number(ordering) : null });
  res.redirect('/admin/modules');
});

router.get('/modules/:id/edit', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/admin/modules');
  res.render('admin/modules/edit', { module: moduleData, error: null });
});

router.put('/modules/:id', async (req, res) => {
  const moduleId = req.params.id;
  const { title, description, learning_outcomes, ordering, is_active } = req.body;
  try {
    await db.updateModuleById(moduleId, {
      title,
      description,
      learning_outcomes,
      ordering: ordering ? Number(ordering) : null,
      is_active: is_active === '1'
    });
    res.redirect('/admin/modules');
  } catch (err) {
    console.error('Update module error:', err);
    const moduleData = await db.getModuleById(moduleId);
    if (!moduleData) return res.redirect('/admin/modules');
    res.status(400).render('admin/modules/edit', { module: moduleData, error: 'Gagal memperbarui modul.' });
  }
});

router.delete('/modules/:id', async (req, res) => {
  const moduleId = req.params.id;
  await db.deleteModuleById(moduleId);
  res.redirect('/admin/modules');
});

router.get('/modules/:id', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/admin/modules');
  const units = await db.getUnitsByModule(moduleId);
  res.render('admin/modules/show', { module: moduleData, units });
});

// Manajemen Unit
router.get('/modules/:id/units/new', async (req, res) => {
  const moduleId = req.params.id;
  const moduleData = await db.getModuleById(moduleId);
  if (!moduleData) return res.redirect('/admin/modules');
  res.render('admin/units/new', { module: moduleData });
});

router.post('/modules/:id/units', async (req, res) => {
  const moduleId = req.params.id;
  const { title, description, ordering } = req.body;
  await db.createUnit({ module_id: moduleId, title, description, ordering: ordering ? Number(ordering) : null });
  res.redirect(`/admin/modules/${moduleId}`);
});

router.get('/units/:unitId/edit', async (req, res) => {
  const unitId = req.params.unitId;
  const unit = await db.getUnitById(unitId);
  if (!unit) return res.redirect('/admin/modules');
  res.render('admin/units/edit', { unit, error: null });
});

router.put('/units/:unitId', async (req, res) => {
  const unitId = req.params.unitId;
  const { title, description, ordering } = req.body;
  try {
    await db.updateUnitById(unitId, { title, description, ordering: ordering ? Number(ordering) : null });
    const unit = await db.getUnitById(unitId);
    if (!unit) return res.redirect('/admin/modules');
    res.redirect(`/admin/modules/${unit.module_id}`);
  } catch (err) {
    console.error('Update unit error:', err);
    const unit = await db.getUnitById(unitId);
    if (!unit) return res.redirect('/admin/modules');
    res.status(400).render('admin/units/edit', { unit, error: 'Gagal memperbarui unit.' });
  }
});

router.delete('/units/:unitId', async (req, res) => {
  const unitId = req.params.unitId;
  const unit = await db.getUnitById(unitId);
  if (!unit) return res.redirect('/admin/modules');
  await db.deleteUnitById(unitId);
  res.redirect(`/admin/modules/${unit.module_id}`);
});

// Manajemen Materi Global (Semua Materi)
router.get('/materials', async (req, res) => {
  try {
    const materials = await db.query(`
      SELECT 
        m.id, m.title, m.content, m.media_type, m.media_url, m.created_at,
        u.id as unit_id, u.title as unit_title,
        mdl.id as module_id, mdl.title as module_title
      FROM materials m
      JOIN units u ON m.unit_id = u.id
      JOIN modules mdl ON u.module_id = mdl.id
      ORDER BY m.created_at DESC
    `);
    res.render('admin/materials/index', { materials });
  } catch (err) {
    console.error('Get all materials error:', err);
    res.redirect('/admin/dashboard');
  }
});

// Manajemen Aktivitas Global (Semua Aktivitas)
router.get('/activities', async (req, res) => {
  try {
    const activities = await db.query(`
      SELECT 
        a.id, a.type, a.title, a.description, a.due_date, a.max_score, a.created_at,
        u.id as unit_id, u.title as unit_title,
        mdl.id as module_id, mdl.title as module_title,
        (SELECT COUNT(*) FROM questions WHERE activity_id = a.id) as question_count
      FROM activities a
      JOIN units u ON a.unit_id = u.id
      JOIN modules mdl ON u.module_id = mdl.id
      ORDER BY a.created_at DESC
    `);
    res.render('admin/activities/index', { activities });
  } catch (err) {
    console.error('Get all activities error:', err);
    res.redirect('/admin/dashboard');
  }
});

// Manajemen Materi per Unit
router.get('/units/:unitId/materials/new', async (req, res) => {
  const unitId = req.params.unitId;
  const units = await db.query('SELECT * FROM units WHERE id = ?', [unitId]);
  // Jika unit tidak ada, kembali ke dashboard modul
  if (!units) return res.redirect('/admin/modules');
  res.render('admin/materials/new', { unit: units });
});

router.post('/units/:unitId/materials', uploadMedia.single('media_file'), async (req, res) => {
  const unitId = req.params.unitId;
  const { title, content, media_type, media_url, upload_method } = req.body;

  let finalMediaUrl = media_url;

  // Jika upload file
  if (upload_method === 'file' && req.file) {
    finalMediaUrl = '/uploads/media/' + req.file.filename;
  }

  await db.createMaterial({ unit_id: unitId, title, content, media_type, media_url: finalMediaUrl });
  // Cari module_id untuk redirect kembali ke halaman modul terkait
  const unitRow = await db.queryOne('SELECT module_id FROM units WHERE id = ?', [unitId]);
  if (unitRow) {
    return res.redirect(`/admin/modules/${unitRow.module_id}`);
  }
  return res.redirect('/admin/modules');
});

router.get('/units/:unitId/materials/:id/edit', async (req, res) => {
  const unitId = req.params.unitId;
  const materialId = req.params.id;
  try {
    const material = await db.queryOne('SELECT * FROM materials WHERE id = ? AND unit_id = ?', [materialId, unitId]);
    if (!material) return res.redirect('/admin/materials');
    const unit = await db.queryOne('SELECT * FROM units WHERE id = ?', [unitId]);
    res.render('admin/materials/edit', { material, unit, error: null });
  } catch (err) {
    console.error('Get material error:', err);
    res.redirect('/admin/materials');
  }
});

router.put('/units/:unitId/materials/:id', uploadMedia.single('media_file'), async (req, res) => {
  const unitId = req.params.unitId;
  const materialId = req.params.id;
  const { title, content, media_type, media_url, upload_method } = req.body;

  let finalMediaUrl = media_url;

  // Jika upload file
  if (upload_method === 'file' && req.file) {
    finalMediaUrl = '/uploads/media/' + req.file.filename;
  }

  try {
    await db.query(
      'UPDATE materials SET title = ?, content = ?, media_type = ?, media_url = ? WHERE id = ? AND unit_id = ?',
      [title, content, media_type, finalMediaUrl, materialId, unitId]
    );
    const unitRow = await db.queryOne('SELECT module_id FROM units WHERE id = ?', [unitId]);
    if (unitRow) {
      return res.redirect(`/admin/modules/${unitRow.module_id}`);
    }
    return res.redirect('/admin/materials');
  } catch (err) {
    console.error('Update material error:', err);
    const material = await db.queryOne('SELECT * FROM materials WHERE id = ? AND unit_id = ?', [materialId, unitId]);
    const unit = await db.queryOne('SELECT * FROM units WHERE id = ?', [unitId]);
    res.status(400).render('admin/materials/edit', { material, unit, error: 'Gagal memperbarui materi.' });
  }
});

// Manajemen Aktivitas (Ujian/Kuis/Tugas) per Unit
router.get('/units/:unitId/activities', async (req, res) => {
  const unitId = req.params.unitId;
  const unit = await db.getUnitById(unitId);
  if (!unit) return res.redirect('/admin/modules');
  const activities = await db.getActivitiesByUnit(unitId);
  res.render('admin/activities/unit', { unit, activities });
});

router.get('/units/:unitId/activities/new', async (req, res) => {
  const unitId = req.params.unitId;
  const type = (req.query.type || 'TASK').toUpperCase();
  const unit = await db.getUnitById(unitId);
  if (!unit) return res.redirect('/admin/modules');
  res.render('admin/activities/new', { unit, type, error: null });
});

router.post('/units/:unitId/activities', async (req, res) => {
  const unitId = req.params.unitId;
  const { type, title, description, due_date, max_score } = req.body;
  try {
    await db.createActivity({
      unit_id: unitId,
      type,
      title,
      description,
      due_date: due_date || null,
      max_score: max_score ? Number(max_score) : null,
      created_by: req.session.user ? req.session.user.id : null
    });
    res.redirect(`/admin/units/${unitId}/activities`);
  } catch (err) {
    console.error('Create activity error:', err);
    const unit = await db.getUnitById(unitId);
    if (!unit) return res.redirect('/admin/modules');
    res.status(400).render('admin/activities/new', { unit, type, error: 'Gagal menyimpan aktivitas.' });
  }
});

router.get('/activities/:id/edit', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity) return res.redirect('/admin/modules');
  const unit = await db.getUnitById(activity.unit_id);
  res.render('admin/activities/edit', { activity, unit, error: null });
});

router.put('/activities/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, due_date, max_score } = req.body;
  try {
    await db.updateActivityById(id, {
      title,
      description,
      due_date: due_date || null,
      max_score: max_score ? Number(max_score) : null
    });
    const activity = await db.getActivityById(id);
    if (!activity) return res.redirect('/admin/modules');
    res.redirect(`/admin/units/${activity.unit_id}/activities`);
  } catch (err) {
    console.error('Update activity error:', err);
    const activity = await db.getActivityById(id);
    if (!activity) return res.redirect('/admin/modules');
    const unit = await db.getUnitById(activity.unit_id);
    res.status(400).render('admin/activities/edit', { activity, unit, error: 'Gagal memperbarui aktivitas.' });
  }
});

router.delete('/activities/:id', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity) return res.redirect('/admin/modules');
  await db.deleteActivityById(id);
  res.redirect(`/admin/units/${activity.unit_id}/activities`);
});

// Hasil mahasiswa per aktivitas (kuis/tugas)
router.get('/activities/:id/results', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity) return res.redirect('/admin/modules');
  const unit = await db.getUnitById(activity.unit_id);
  let quizAttempts = [];
  let taskSubmissions = [];
  if (activity.type === 'QUIZ') {
    quizAttempts = await db.getActivityAttemptsWithStudent(id);
  } else if (activity.type === 'TASK') {
    taskSubmissions = await db.query(
      'SELECT ts.*, u.name, u.email FROM task_submissions ts JOIN users u ON ts.student_id = u.id WHERE ts.activity_id = ? ORDER BY ts.submitted_at DESC',
      [id]
    );
  }
  res.render('admin/activities/results', { activity, unit, quizAttempts, taskSubmissions });
});

// Manajemen Soal Kuis untuk aktivitas QUIZ
router.get('/activities/:id/questions', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'QUIZ') {
    return res.redirect('/admin/modules');
  }
  const unit = await db.getUnitById(activity.unit_id);
  const questions = await db.getQuestionsByActivity(id);
  res.render('admin/activities/questions/index', { activity, unit, questions });
});

router.get('/activities/:id/questions/new', async (req, res) => {
  const id = req.params.id;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'QUIZ') {
    return res.redirect('/admin/modules');
  }
  const unit = await db.getUnitById(activity.unit_id);
  res.render('admin/activities/questions/new', { activity, unit, error: null });
});

router.post('/activities/:id/questions', async (req, res) => {
  const id = req.params.id;
  const { question_text, optionA, optionB, optionC, optionD, answer_key, ordering } = req.body;
  const activity = await db.getActivityById(id);
  if (!activity || activity.type !== 'QUIZ') {
    return res.redirect('/admin/modules');
  }
  const unit = await db.getUnitById(activity.unit_id);
  if (!question_text || !optionA || !optionB || !answer_key) {
    return res.status(400).render('admin/activities/questions/new', {
      activity,
      unit,
      error: 'Minimal isi pertanyaan, opsi A, opsi B, dan jawaban benar.'
    });
  }
  try {
    const options = {
      A: optionA,
      B: optionB,
      C: optionC || '',
      D: optionD || ''
    };
    await db.createQuestion({
      activity_id: id,
      question_text,
      question_type: 'MCQ',
      options_json: JSON.stringify(options),
      answer_key,
      ordering: ordering ? Number(ordering) : null
    });
    res.redirect(`/admin/activities/${id}/questions`);
  } catch (err) {
    console.error('Create question error:', err);
    res.status(400).render('admin/activities/questions/new', {
      activity,
      unit,
      error: 'Gagal menyimpan soal.'
    });
  }
});

router.post('/questions/:questionId/delete', async (req, res) => {
  const questionId = req.params.questionId;
  const activityId = req.body.activity_id;
  if (!activityId) return res.redirect('/admin/modules');
  await db.deleteQuestionById(questionId);
  res.redirect(`/admin/activities/${activityId}/questions`);
});

// Manajemen Pengguna (khusus ADMIN)
router.get('/users', requireAdminOnly, async (req, res) => {
  const users = await db.getAllUsers();
  res.render('admin/users/index', { users });
});

router.get('/users/new', requireAdminOnly, (req, res) => {
  res.render('admin/users/new', { error: null });
});

router.post('/users', requireAdminOnly, async (req, res) => {
  const { name, email, password, role, institution, semester } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.createUser({ name, email, password_hash: hash, role, institution, semester });
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Create user error:', err);
    let error = 'Terjadi kesalahan saat menyimpan data pengguna.';
    if (err && err.code === 'ER_DUP_ENTRY') {
      error = 'Email sudah digunakan. Silakan gunakan email lain.';
    }
    res.status(400).render('admin/users/new', { error });
  }
});

router.get('/users/:id/edit', requireAdminOnly, async (req, res) => {
  const userId = req.params.id;
  const user = await db.getUserById(userId);
  if (!user || user.email === 'admin@emodul-pai.local') {
    return res.redirect('/admin/users');
  }
  res.render('admin/users/edit', { user, error: null });
});

router.put('/users/:id', requireAdminOnly, async (req, res) => {
  const userId = req.params.id;
  const { name, email, role, institution, semester, status } = req.body;
  try {
    await db.updateUserById(userId, { name, email, role, institution, semester, status });
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Update user error:', err);
    let error = 'Terjadi kesalahan saat memperbarui data pengguna.';
    if (err && err.code === 'ER_DUP_ENTRY') {
      error = 'Email sudah digunakan. Silakan gunakan email lain.';
    }
    const user = await db.getUserById(userId);
    if (!user) return res.redirect('/admin/users');
    res.status(400).render('admin/users/edit', { user, error });
  }
});

router.delete('/users/:id', requireAdminOnly, async (req, res) => {
  const userId = req.params.id;
  // Opsional: cegah penghapusan admin default
  const users = await db.getAllUsers();
  const target = users.find((u) => String(u.id) === String(userId));
  if (!target || target.email === 'admin@emodul-pai.local') {
    return res.redirect('/admin/users');
  }
  await db.deleteUserById(userId);
  res.redirect('/admin/users');
});

// ========== MANAJEMEN MEDIA DIGITAL ==========
router.get('/media', async (req, res) => {
  const media = await db.query('SELECT * FROM digital_media ORDER BY uploaded_at DESC');
  res.render('admin/media/index', { media });
});

router.get('/media/upload', (req, res) => {
  res.render('admin/media/upload', { error: null });
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
      return res.status(400).render('admin/media/upload', { error: 'URL media atau file harus diisi.' });
    }

    await db.query(
      'INSERT INTO digital_media (title, media_type, media_url, description, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [title, media_type, finalMediaUrl, description, req.session.user.id]
    );
    res.redirect('/admin/media');
  } catch (err) {
    console.error('Upload media error:', err);
    res.status(400).render('admin/media/upload', { error: 'Gagal mengupload media: ' + err.message });
  }
});

router.delete('/media/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM digital_media WHERE id = ?', [id]);
  res.redirect('/admin/media');
});

// ========== MANAJEMEN NILAI TRANSFORMATIF ==========
router.get('/transformative-values', async (req, res) => {
  // Ambil semua nilai transformatif yang sudah didefinisikan
  const values = await db.query('SELECT * FROM transformative_values ORDER BY created_at DESC');
  res.render('admin/transformative_values/index', { values });
});

router.get('/transformative-values/new', (req, res) => {
  res.render('admin/transformative_values/new', { error: null });
});

router.post('/transformative-values', async (req, res) => {
  const { value_name, description, indicators } = req.body;
  try {
    await db.query(
      'INSERT INTO transformative_values (value_name, description, indicators) VALUES (?, ?, ?)',
      [value_name, description, indicators]
    );
    res.redirect('/admin/transformative-values');
  } catch (err) {
    console.error('Create transformative value error:', err);
    res.status(400).render('admin/transformative_values/new', { error: 'Gagal menyimpan nilai transformatif.' });
  }
});

router.get('/transformative-values/:id/edit', async (req, res) => {
  const id = req.params.id;
  const value = await db.queryOne('SELECT * FROM transformative_values WHERE id = ?', [id]);
  if (!value) return res.redirect('/admin/transformative-values');
  res.render('admin/transformative_values/edit', { value, error: null });
});

router.put('/transformative-values/:id', async (req, res) => {
  const id = req.params.id;
  const { value_name, description, indicators } = req.body;
  try {
    await db.query(
      'UPDATE transformative_values SET value_name = ?, description = ?, indicators = ? WHERE id = ?',
      [value_name, description, indicators, id]
    );
    res.redirect('/admin/transformative-values');
  } catch (err) {
    console.error('Update transformative value error:', err);
    const value = await db.queryOne('SELECT * FROM transformative_values WHERE id = ?', [id]);
    res.status(400).render('admin/transformative_values/edit', { value, error: 'Gagal memperbarui nilai transformatif.' });
  }
});

router.delete('/transformative-values/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM transformative_values WHERE id = ?', [id]);
  res.redirect('/admin/transformative-values');
});

// Penilaian nilai transformatif per mahasiswa
router.get('/transformative-values/assessments', async (req, res) => {
  const students = await db.query('SELECT * FROM users WHERE role = "STUDENT" ORDER BY name');
  const values = await db.query('SELECT * FROM transformative_values');
  res.render('admin/transformative_values/assessments', { students, values });
});

router.get('/transformative-values/assessments/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  const student = await db.getUserById(studentId);
  if (!student || student.role !== 'STUDENT') {
    return res.redirect('/admin/transformative-values/assessments');
  }

  const values = await db.query('SELECT * FROM transformative_values');
  const assessments = await db.query(
    'SELECT * FROM transformative_assessments WHERE student_id = ?',
    [studentId]
  );

  res.render('admin/transformative_values/assess_student', { student, values, assessments });
});

router.post('/transformative-values/assessments/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  const { value_id, score, notes } = req.body;

  try {
    // Check if assessment already exists
    const existing = await db.queryOne(
      'SELECT * FROM transformative_assessments WHERE student_id = ? AND value_id = ?',
      [studentId, value_id]
    );

    if (existing) {
      await db.query(
        'UPDATE transformative_assessments SET score = ?, notes = ?, assessed_at = NOW() WHERE id = ?',
        [score, notes, existing.id]
      );
    } else {
      await db.query(
        'INSERT INTO transformative_assessments (student_id, value_id, score, notes, assessed_by) VALUES (?, ?, ?, ?, ?)',
        [studentId, value_id, score, notes, req.session.user.id]
      );
    }

    res.redirect(`/admin/transformative-values/assessments/${studentId}`);
  } catch (err) {
    console.error('Save transformative assessment error:', err);
    res.redirect(`/admin/transformative-values/assessments/${studentId}`);
  }
});

// ========== PENGATURAN SISTEM ==========
router.get('/settings', requireAdminOnly, async (req, res) => {
  // Ambil pengaturan sistem dari database atau file konfigurasi
  const settings = {
    siteName: 'E-Modul PAI',
    siteDescription: 'Pembelajaran PAI di Perguruan Tinggi',
    theme: 'light',
    enableRegistration: true,
    maintenanceMode: false
  };

  res.render('admin/settings/index', { settings });
});

router.post('/settings', requireAdminOnly, async (req, res) => {
  const { siteName, siteDescription, theme, enableRegistration, maintenanceMode } = req.body;

  try {
    // Simpan pengaturan ke database atau file konfigurasi
    // Untuk saat ini, kita akan simpan ke tabel settings
    await db.query('DELETE FROM system_settings');
    await db.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)',
      [
        'siteName', siteName,
        'siteDescription', siteDescription,
        'theme', theme,
        'enableRegistration', enableRegistration ? '1' : '0',
        'maintenanceMode', maintenanceMode ? '1' : '0'
      ]
    );

    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Save settings error:', err);
    res.redirect('/admin/settings');
  }
});

// Database backup
router.get('/settings/backup', requireAdminOnly, (req, res) => {
  res.render('admin/settings/backup');
});

router.post('/settings/backup', requireAdminOnly, async (req, res) => {
  try {
    // Trigger database backup
    // Implementasi backup tergantung database yang digunakan
    res.redirect('/admin/settings/backup');
  } catch (err) {
    console.error('Backup error:', err);
    res.redirect('/admin/settings/backup');
  }
});

// Log aktivitas
router.get('/settings/logs', requireAdminOnly, async (req, res) => {
  const logs = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
  res.render('admin/settings/logs', { logs });
});

module.exports = router;
