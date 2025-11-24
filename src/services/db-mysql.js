// Koneksi MySQL (untuk migrasi dari SQLite)
// Gunakan mysql2 dan environment variable untuk konfigurasi.

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log(process.env.MYSQL_USER)

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'emodul_pai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function queryOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function seedAdmin() {
  const existing = await queryOne('SELECT * FROM users WHERE email = ?', ['admin@emodul-pai.local']);
  if (!existing) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await query(
      'INSERT INTO users (name, email, password_hash, role, institution, status) VALUES (?,?,?,?,?,?)',
      ['Admin', 'admin@emodul-pai.local', hash, 'ADMIN', 'PTU', 'ACTIVE']
    );
    console.log('MySQL: Default admin created: admin@emodul-pai.local / admin123');
  }
}

seedAdmin().catch((err) => console.error('MySQL seed admin error', err));

module.exports = {
  pool,
  query,
  queryOne,
  // Users
  async getUserByEmail(email) {
    return queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },
  async getUserById(id) {
    return queryOne('SELECT * FROM users WHERE id = ?', [id]);
  },
  async getAllUsers() {
    return query('SELECT id, name, email, role, institution, semester, status FROM users ORDER BY id', []);
  },
  async createUser({ name, email, password_hash, role, institution, semester }) {
    await query(
      'INSERT INTO users (name, email, password_hash, role, institution, semester, status) VALUES (?,?,?,?,?,?,?)',
      [name, email, password_hash, role, institution || null, semester || null, 'ACTIVE']
    );
  },
  async deleteUserById(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  },
  async updateUserById(id, { name, email, role, institution, semester, status }) {
    await query(
      'UPDATE users SET name = ?, email = ?, role = ?, institution = ?, semester = ?, status = ? WHERE id = ?',
      [name, email, role, institution || null, semester || null, status || 'ACTIVE', id]
    );
  },
  // Dashboard
  async getStudentDashboard(studentId) {
    const modules = await query('SELECT * FROM modules WHERE is_active = 1 ORDER BY ordering IS NULL, ordering, id', []);
    const progress = await query('SELECT * FROM student_progress WHERE student_id = ?', [studentId]);
    return { modules, progress };
  },
  async getAdminDashboard() {
    const totalUsers = await queryOne('SELECT COUNT(*) AS count FROM users', []);
    const totalModules = await queryOne('SELECT COUNT(*) AS count FROM modules', []);
    const totalUnits = await queryOne('SELECT COUNT(*) AS count FROM units', []);
    return {
      totalUsers: totalUsers ? totalUsers.count : 0,
      totalModules: totalModules ? totalModules.count : 0,
      totalUnits: totalUnits ? totalUnits.count : 0
    };
  },
  // Modules
  async getAllModules() {
    return query('SELECT * FROM modules ORDER BY ordering IS NULL, ordering, id', []);
  },
  async getModuleById(id) {
    return queryOne('SELECT * FROM modules WHERE id = ?', [id]);
  },
  async createModule({ title, description, learning_outcomes, ordering }) {
    await query(
      'INSERT INTO modules (title, description, learning_outcomes, ordering, is_active) VALUES (?,?,?,?,1)',
      [title, description, learning_outcomes, ordering || null]
    );
  },
  async updateModuleById(id, { title, description, learning_outcomes, ordering, is_active }) {
    await query(
      'UPDATE modules SET title = ?, description = ?, learning_outcomes = ?, ordering = ?, is_active = ? WHERE id = ?',
      [title, description, learning_outcomes, ordering || null, is_active ? 1 : 0, id]
    );
  },
  async deleteModuleById(id) {
    await query('DELETE FROM modules WHERE id = ?', [id]);
  },
  // Units
  async getUnitsByModule(moduleId) {
    return query('SELECT * FROM units WHERE module_id = ? ORDER BY ordering IS NULL, ordering, id', [moduleId]);
  },
  async createUnit({ module_id, title, description, ordering }) {
    await query(
      'INSERT INTO units (module_id, title, description, ordering) VALUES (?,?,?,?)',
      [module_id, title, description, ordering || null]
    );
  },
  async getUnitById(id) {
    return queryOne('SELECT * FROM units WHERE id = ?', [id]);
  },
  async updateUnitById(id, { title, description, ordering }) {
    await query('UPDATE units SET title = ?, description = ?, ordering = ? WHERE id = ?', [title, description, ordering || null, id]);
  },
  async deleteUnitById(id) {
    await query('DELETE FROM units WHERE id = ?', [id]);
  },
  // Materials
  async getMaterialsByUnit(unitId) {
    return query('SELECT * FROM materials WHERE unit_id = ? ORDER BY id', [unitId]);
  },
  async createMaterial({ unit_id, title, content, media_type, media_url }) {
    await query(
      'INSERT INTO materials (unit_id, title, content, media_type, media_url) VALUES (?,?,?,?,?)',
      [unit_id, title, content, media_type, media_url]
    );
  },
  // Activities (Ujian/Kuis/Tugas)
  async getActivitiesByUnit(unitId) {
    return query('SELECT * FROM activities WHERE unit_id = ? ORDER BY due_date IS NULL, due_date, id', [unitId]);
  },
  async getActivityById(id) {
    return queryOne('SELECT * FROM activities WHERE id = ?', [id]);
  },
  async createActivity({ unit_id, type, title, description, due_date, max_score, created_by }) {
    await query(
      'INSERT INTO activities (unit_id, type, title, description, due_date, max_score, created_by) VALUES (?,?,?,?,?,?,?)',
      [unit_id, type, title, description, due_date || null, max_score || null, created_by || null]
    );
  },
  async updateActivityById(id, { title, description, due_date, max_score }) {
    await query(
      'UPDATE activities SET title = ?, description = ?, due_date = ?, max_score = ? WHERE id = ?',
      [title, description, due_date || null, max_score || null, id]
    );
  },
  async deleteActivityById(id) {
    await query('DELETE FROM activities WHERE id = ?', [id]);
  },
  // Questions (Soal Kuis)
  async getQuestionsByActivity(activityId) {
    return query('SELECT * FROM questions WHERE activity_id = ? ORDER BY ordering IS NULL, ordering, id', [activityId]);
  },
  async createQuestion({ activity_id, question_text, question_type, options_json, answer_key, ordering }) {
    await query(
      'INSERT INTO questions (activity_id, question_text, question_type, options_json, answer_key, ordering) VALUES (?,?,?,?,?,?)',
      [activity_id, question_text, question_type || 'MCQ', options_json, answer_key, ordering || null]
    );
  },
  async deleteQuestionById(id) {
    await query('DELETE FROM questions WHERE id = ?', [id]);
  },
  // Activity attempts (hasil kuis)
  async createActivityAttempt({ activity_id, student_id, score, answers_json }) {
    await query(
      'INSERT INTO activity_attempts (activity_id, student_id, score, answers_json) VALUES (?,?,?,?)',
      [activity_id, student_id, score, answers_json]
    );
  },
  async getLastActivityAttempt(activity_id, student_id) {
    return queryOne(
      'SELECT * FROM activity_attempts WHERE activity_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
      [activity_id, student_id]
    );
  },
  async getActivityAttemptsWithStudent(activity_id) {
    return query(
      'SELECT aa.*, u.name, u.email FROM activity_attempts aa JOIN users u ON aa.student_id = u.id WHERE aa.activity_id = ? ORDER BY aa.submitted_at DESC',
      [activity_id]
    );
  },
  // Task submissions (jawaban tugas)
  async createTaskSubmission({ activity_id, student_id, answer_text, attachment_url }) {
    await query(
      'INSERT INTO task_submissions (activity_id, student_id, answer_text, attachment_url) VALUES (?,?,?,?)',
      [activity_id, student_id, answer_text, attachment_url || null]
    );
  },
  async getLastTaskSubmission(activity_id, student_id) {
    return queryOne(
      'SELECT * FROM task_submissions WHERE activity_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
      [activity_id, student_id]
    );
  },
  // Student progress helper
  async getStudentProgressByUnit(studentId, unitId) {
    return queryOne('SELECT * FROM student_progress WHERE student_id = ? AND unit_id = ?', [studentId, unitId]);
  },
  async upsertStudentProgressCompletion(studentId, unitId, status, completion_percentage) {
    const existing = await queryOne('SELECT * FROM student_progress WHERE student_id = ? AND unit_id = ?', [studentId, unitId]);
    if (existing) {
      await query(
        'UPDATE student_progress SET status = ?, completion_percentage = ?, last_accessed_at = NOW() WHERE id = ?',
        [status, completion_percentage, existing.id]
      );
    } else {
      await query(
        'INSERT INTO student_progress (student_id, unit_id, status, completion_percentage, last_accessed_at) VALUES (?,?,?,?,NOW())',
        [studentId, unitId, status, completion_percentage]
      );
    }
  }
};