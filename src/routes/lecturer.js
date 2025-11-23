const express = require('express');
const router = express.Router();
const db = require('../services/db-mysql');

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

// Panduan manajemen skenario PBL untuk dosen
router.get('/pbl-scenarios', (req, res) => {
  res.render('lecturer/pbl_scenarios');
});

module.exports = router;
