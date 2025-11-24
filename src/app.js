const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(expressLayouts);


app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, '..', 'db') }),
    secret: 'supersecret-key-pai-emodul',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
  })
);

app.use((req, res, next) => {
  res.locals.form = {};  // default supaya tidak undefined
  next();
});


// Simple middleware for user role injection to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const lecturerRoutes = require('./routes/lecturer');

app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/lecturer', lecturerRoutes);

// Halaman awal: jika belum login tampilkan landing page; jika sudah login arahkan ke dashboard peran
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.render('home', { title: 'E-Modul PAI - Pembelajaran PAI di Perguruan Tinggi' });
  }
  if (req.session.user.role === 'STUDENT') {
    return res.redirect('/student/dashboard');
  }
  if (req.session.user.role === 'LECTURER') {
    return res.redirect('/lecturer/dashboard');
  }
  return res.redirect('/admin/dashboard');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404');
});

app.listen(PORT, HOST,() => {
  console.log(`E-Modul Interaktif PAI running on http://localhost:${PORT}`);
});