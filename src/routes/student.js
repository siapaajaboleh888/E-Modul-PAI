const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');

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
  res.render('student/glossary');
});

// Halaman Pengaturan / Profil (placeholder)
router.get('/profile', (req, res) => {
  res.render('student/profile');
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

module.exports = router;
