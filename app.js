const path = require('path');
const fs = require('fs');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const multer = require('multer');
const storeRouter = require('./routes/storeRouter');
const { hostRouter } = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const rootDir = require('./utils/pathUtil');

const app = express();
const DB_PATH = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PORT = Number(process.env.PORT) || 7000;
if (!DB_PATH || !SESSION_SECRET) {
  console.error('Set MONGODB_URI and SESSION_SECRET in your environment or .env file before starting the app.');
  process.exit(1);
}
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
const uploadDir = path.join(rootDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, uploadDir),
  filename: (_req, file, done) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '-');
    done(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) => /^image\/(jpeg|png|webp)$/.test(file.mimetype) ? done(null, true) : done(new Error('Please upload a JPG, PNG, or WebP image.'))
});
app.use((req, res, next) => req.method === 'POST' && req.path.startsWith('/host/') ? upload.single('photo')(req, res, next) : next());
const sessionStore = new MongoDBStore({ uri: DB_PATH, collection: 'sessions' });
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false, store: sessionStore, cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 } }));
app.use((req, res, next) => {
  req.isLoggedIn = Boolean(req.session.isLoggedIn);
  req.user = req.session.user || null;
  Object.assign(res.locals, { isLoggedIn: req.isLoggedIn, user: req.user, errors: [], bookingError: null, error: null, message: null });
  res.locals.photoUrl = photo => typeof photo === 'string' && photo.trim() ? (photo.startsWith('/') ? photo : "/" + photo) : '/images/house1.png';
  next();
});
app.use(authRouter);
app.use(storeRouter);
app.use('/host', (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  if (req.user.userType !== 'host') return res.status(403).render('404', { pageTitle: 'Access denied', message: 'This page is for hosts.' });
  next();
}, hostRouter);
app.use((req, res) => res.status(404).render('404', { pageTitle: 'Page not found' }));
app.use((err, req, res, _next) => {
  console.error(err);
  const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE' ? 'Images must be 5 MB or smaller.' : err.message || 'Something went wrong.';
  res.status(400).render('404', { pageTitle: 'Request error', message });
});
mongoose.connect(DB_PATH).then(() => app.listen(PORT, '0.0.0.0', () => console.log(`Stayfinder listening on 0.0.0.0:${PORT}`))).catch(err => {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
});




