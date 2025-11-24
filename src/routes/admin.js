const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');
const bcrypt = require('bcryptjs');

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

// Manajemen Materi per Unit
router.get('/units/:unitId/materials/new', async (req, res) => {
  const unitId = req.params.unitId;
  const units = await db.query('SELECT * FROM units WHERE id = ?', [unitId]);
  // Jika unit tidak ada, kembali ke dashboard modul
  if (!units) return res.redirect('/admin/modules');
  res.render('admin/materials/new', { unit: units });
});

router.post('/units/:unitId/materials', async (req, res) => {
  const unitId = req.params.unitId;
  const { title, content, media_type, media_url } = req.body;
  await db.createMaterial({ unit_id: unitId, title, content, media_type, media_url });
  // Cari module_id untuk redirect kembali ke halaman modul terkait
  const unitRow = await db.queryOne('SELECT module_id FROM units WHERE id = ?', [unitId]);
  if (unitRow) {
    return res.redirect(`/admin/modules/${unitRow.module_id}`);
  }
  return res.redirect('/admin/modules');
});

// Manajemen Aktivitas (Ujian/Kuis/Tugas) per Unit
router.get('/units/:unitId/activities', async (req, res) => {
  const unitId = req.params.unitId;
  const unit = await db.getUnitById(unitId);
  if (!unit) return res.redirect('/admin/modules');
  const activities = await db.getActivitiesByUnit(unitId);
  res.render('admin/activities/index', { unit, activities });
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

module.exports = router;
