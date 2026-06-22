if (!globalThis.crypto) {
    globalThis.crypto = require('crypto');
}

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const compression= require('compression');
const rateLimit  = require('express-rate-limit');
const dotenv     = require('dotenv');
const { Server } = require('socket.io');
const connectDB  = require('./src/config/db');

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// ── Allowed origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
].filter(Boolean);

// ── DB ───────────────────────────────────────────────────────────────────────
connectDB().then(async () => {
    try {
        const Fee = require('./src/models/Fee');
        const result = await Fee.updateMany(
            { status: 'pending', dueDate: { $lt: new Date() } },
            { $set: { status: 'overdue' } }
        );
        if (result.modifiedCount > 0)
            console.log(`✓ Marked ${result.modifiedCount} fee(s) as overdue.`);
    } catch (e) { console.error('Overdue update failed:', e.message); }

    // Schedule the daily birthday-greeting job
    try {
        require('./src/utils/birthdayJob').scheduleBirthdayJob();
    } catch (e) { console.error('Birthday job scheduling failed:', e.message); }
});

const app    = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// ── Security headers (helmet) ────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Drive images
    contentSecurityPolicy: false,                           // let Vite handle CSP
}));

// ── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── MongoDB Injection Sanitizer ──────────────────────────────────────────────
const sanitizeQuery = (obj) => {
    if (obj instanceof Object) {
        for (const k in obj) {
            if (k.startsWith('$') || k.includes('.')) {
                delete obj[k];
            } else {
                sanitizeQuery(obj[k]);
            }
        }
    }
    return obj;
};

app.use((req, res, next) => {
    req.body = sanitizeQuery(req.body);
    req.query = sanitizeQuery(req.query);
    req.params = sanitizeQuery(req.params);
    next();
});

// ── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,  // tighter on auth
    message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});
// enquiryLimiter is defined inside enquiryRoutes.js — applied only to POST, not to Sir's GET reads

app.use(globalLimiter);

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: ALLOWED_ORIGINS, credentials: true },
});

io.on('connection', (socket) => {
    socket.on('join_doubt',  (id) => socket.join(`doubt_${id}`));
    socket.on('leave_doubt', (id) => socket.leave(`doubt_${id}`));
});

app.set('io', io);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, require('./src/routes/authRoutes'));
app.use('/api/users',    require('./src/routes/userRoutes'));
app.use('/api/notices',  require('./src/routes/noticeRoutes'));
app.use('/api/materials',require('./src/routes/materialRoutes'));
app.use('/api/fees',     require('./src/routes/feeRoutes'));
app.use('/api/doubts',   require('./src/routes/doubtRoutes'));
app.use('/api/tests',    require('./src/routes/testRoutes'));
app.use('/api/homework', require('./src/routes/homeworkRoutes'));
app.use('/api/push',     require('./src/routes/pushRoutes'));
app.use('/api/enquiry',  require('./src/routes/enquiryRoutes'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));
app.get('/',       (req, res) => res.json({ message: 'Choksi Classes API', version: '1.0.0' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    // Multer upload errors (e.g. file too large) → 400, not 500
    if (err.name === 'MulterError') {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : 'File upload error';
        return res.status(400).json({ message: msg });
    }
    if (isProd) {
        console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
        return res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
    }
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 7860;
server.listen(PORT, () =>
    console.log(`🚀 Choksi Classes API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);
