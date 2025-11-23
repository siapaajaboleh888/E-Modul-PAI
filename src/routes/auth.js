const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const db = require('../services/db-mysql');

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Register
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null, form: {} });
});

router.post('/register', async (req, res) => {
  let { name, email, reg_email, role, institution, semester, password, password_confirm } = req.body;
  // Untuk menghindari autofill browser, field email di form menggunakan nama reg_email
  if (!email && reg_email) {
    email = reg_email;
  }
  const form = { name, email, role, institution, semester };

  if (!name || !email || !role || !institution || !semester || !password || !password_confirm) {
    return res.render('auth/register', { error: 'Semua field wajib diisi.', form });
  }

  // Validasi semester hanya angka positif
  const semesterNum = parseInt(semester, 10);
  if (Number.isNaN(semesterNum) || semesterNum <= 0) {
    return res.render('auth/register', { error: 'Semester harus berupa angka positif.', form });
  }

  // Validasi kekuatan password: minimal 8 karakter, mengandung huruf, angka, dan simbol
  const passwordStrong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordStrong.test(password)) {
    return res.render('auth/register', {
      error: 'Password minimal 8 karakter dan harus mengandung huruf, angka, dan simbol.',
      form
    });
  }

  if (password !== password_confirm) {
    return res.render('auth/register', { error: 'Password dan konfirmasi password tidak sama.', form });
  }

  if (!['STUDENT', 'LECTURER'].includes(role)) {
    return res.render('auth/register', { error: 'Peran tidak valid.', form });
  }
  try {
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.render('auth/register', { error: 'Email sudah terdaftar. Silakan login.', form });
    }
    const password_hash = await bcrypt.hash(password, 10);
    await db.createUser({
      name,
      email,
      password_hash,
      role,
      institution: institution || null,
      semester: semesterNum.toString(),
      status: 'ACTIVE'
    });
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('auth/register', { 
    error: 'Terjadi kesalahan pada sistem.',
    form
  });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.render('auth/login', { error: 'Email atau password salah.' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('auth/login', { error: 'Email atau password salah.' });
    }
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution || null,
      semester: user.semester || null,
      status: user.status || null
    };
    if (user.role === 'STUDENT') {
      return res.redirect('/student/dashboard');
    }
    if (user.role === 'LECTURER') {
      return res.redirect('/lecturer/dashboard');
    }
    return res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('auth/login', { error: 'Terjadi kesalahan pada sistem.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
