const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', '..', 'db', 'emodul_pai.sqlite');
const db = new sqlite3.Database(dbPath);

// Simple helpers with Promise
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('STUDENT','LECTURER','ADMIN')),
    institution TEXT,
    semester TEXT,
    status TEXT DEFAULT 'ACTIVE'
  );`);

  await run(`CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    learning_outcomes TEXT,
    ordering INTEGER,
    is_active INTEGER DEFAULT 1
  );`);

  await run(`CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ordering INTEGER,
    FOREIGN KEY (module_id) REFERENCES modules(id)
  );`);

  await run(`CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    status TEXT,
    completion_percentage REAL DEFAULT 0,
    last_accessed_at TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );`);

  await run(`CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    media_type TEXT,
    media_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );`);

  // seed admin if not exists
  const admin = await get('SELECT * FROM users WHERE email = ?', ['admin@emodul-pai.local']);
  if (!admin) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password_hash, role, institution) VALUES (?,?,?,?,?)',
      ['Admin', 'admin@emodul-pai.local', hash, 'ADMIN', 'PTU']
    );
    console.log('Default admin created: admin@emodul-pai.local / admin123');
  }
}

init().catch((err) => console.error('DB init error', err));

module.exports = {
  // expose low-level helpers when needed
  _run: run,
  _get: get,
  _all: all,
  getUserByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
  },
  getAllUsers() {
    return all('SELECT id, name, email, role, institution, semester, status FROM users ORDER BY id');
  },
  async createUser({ name, email, password_hash, role, institution, semester }) {
    return run(
      'INSERT INTO users (name, email, password_hash, role, institution, semester, status) VALUES (?,?,?,?,?,?,?)',
      [name, email, password_hash, role, institution || null, semester || null, 'ACTIVE']
    );
  },
  async getStudentDashboard(studentId) {
    const modules = await all('SELECT * FROM modules WHERE is_active = 1 ORDER BY ordering NULLS LAST, id');
    const progress = await all('SELECT * FROM student_progress WHERE student_id = ?', [studentId]);
    return { modules, progress };
  },
  async getAdminDashboard() {
    const totalUsers = await get('SELECT COUNT(*) as count FROM users');
    const totalModules = await get('SELECT COUNT(*) as count FROM modules');
    const totalUnits = await get('SELECT COUNT(*) as count FROM units');
    return {
      totalUsers: totalUsers.count,
      totalModules: totalModules.count,
      totalUnits: totalUnits.count
    };
  },
  // Modules
  getAllModules() {
    return all('SELECT * FROM modules ORDER BY ordering NULLS LAST, id');
  },
  getModuleById(id) {
    return get('SELECT * FROM modules WHERE id = ?', [id]);
  },
  createModule({ title, description, learning_outcomes, ordering }) {
    return run(
      'INSERT INTO modules (title, description, learning_outcomes, ordering) VALUES (?,?,?,?)',
      [title, description, learning_outcomes, ordering || null]
    );
  },
  // Units
  getUnitsByModule(moduleId) {
    return all('SELECT * FROM units WHERE module_id = ? ORDER BY ordering NULLS LAST, id', [moduleId]);
  },
  createUnit({ module_id, title, description, ordering }) {
    return run(
      'INSERT INTO units (module_id, title, description, ordering) VALUES (?,?,?,?)',
      [module_id, title, description, ordering || null]
    );
  },
  // Materials
  getMaterialsByUnit(unitId) {
    return all('SELECT * FROM materials WHERE unit_id = ? ORDER BY id', [unitId]);
  },
  createMaterial({ unit_id, title, content, media_type, media_url }) {
    return run(
      'INSERT INTO materials (unit_id, title, content, media_type, media_url) VALUES (?,?,?,?,?)',
      [unit_id, title, content, media_type, media_url]
    );
  }
};
