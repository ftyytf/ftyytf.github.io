// ============================================
// CryptoFlow Server - Auth + Static Files
// ============================================

// FIX: Allow self-signed certificates (corporate networks)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ============================================
// CONFIG
// ============================================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ============================================
// SMTP TRANSPORT (Mail.ru) - with TLS fix
// ============================================
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Check SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error('[SMTP] Connection failed:', error.message);
    } else {
        console.log('[SMTP] Ready to send emails via', process.env.SMTP_USER);
    }
});

// ============================================
// IN-MEMORY STORAGE for verification codes
// ============================================
const verificationCodes = new Map();

// ============================================
// HELPERS
// ============================================
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function findUserByEmail(email) {
    return getUsers().find(u => u.email === email.toLowerCase());
}

function findUserByTelegramId(telegramId) {
    return getUsers().find(u => u.telegramId === telegramId);
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ============================================
// EMAIL TEMPLATE
// ============================================
function getEmailHTML(code, type) {
    const title = type === 'register' ? 'Регистрация' : 'Вход в аккаунт';
    const subtitle = type === 'register'
        ? 'Для завершения регистрации введите код:'
        : 'Для входа в аккаунт введите код:';

    return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="margin:0;padding:0;background:#0f0b1e;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">' +
    '<div style="max-width:480px;margin:0 auto;padding:40px 20px">' +
    '<div style="background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(6,182,212,.1));border:1px solid rgba(99,102,241,.2);border-radius:24px;padding:40px;text-align:center">' +
    '<div style="font-size:2.5rem;margin-bottom:16px">&#128274;</div>' +
    '<h1 style="color:#f1f5f9;font-size:1.5rem;margin:0 0 8px">' + title + '</h1>' +
    '<p style="color:#94a3b8;font-size:.95rem;margin:0 0 32px">' + subtitle + '</p>' +
    '<div style="background:rgba(99,102,241,.15);border:2px dashed rgba(99,102,241,.3);border-radius:16px;padding:24px;margin-bottom:24px">' +
    '<span style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#818cf8;font-family:monospace">' + code + '</span>' +
    '</div>' +
    '<p style="color:#64748b;font-size:.8rem;margin:0">Код действителен 10 минут. Если вы не запрашивали код — проигнорируйте это письмо.</p>' +
    '</div>' +
    '<p style="text-align:center;color:#334155;font-size:.75rem;margin-top:24px">© 2025 CryptoFlow. Все права защищены.</p>' +
    '</div></body></html>';
}

// ============================================
// API ROUTES
// ============================================

// --- Send code to email ---
app.post('/api/auth/send-code', async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Некорректный email' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = findUserByEmail(normalizedEmail);

        if (type === 'register' && existingUser) {
            return res.status(400).json({ error: 'Этот email уже зарегистрирован' });
        }
        if (type === 'login' && !existingUser) {
            return res.status(400).json({ error: 'Аккаунт не найден. Зарегистрируйтесь' });
        }

        // Rate limiting
        const existing = verificationCodes.get(normalizedEmail);
        if (existing && (Date.now() - existing.created) < 60000) {
            const wait = Math.ceil((60000 - (Date.now() - existing.created)) / 1000);
            return res.status(429).json({ error: 'Подождите ' + wait + ' сек.' });
        }

        const code = generateCode();

        verificationCodes.set(normalizedEmail, {
            code: code,
            created: Date.now(),
            expires: Date.now() + 10 * 60 * 1000,
            attempts: 0,
            type: type
        });

        await transporter.sendMail({
            from: '"CryptoFlow" <cryptoflowby@mail.ru>',
            to: normalizedEmail,
            subject: type === 'register' ? 'Kod registracii - CryptoFlow' : 'Kod vhoda - CryptoFlow',
            html: getEmailHTML(code, type)
        });

        console.log('[AUTH] Code sent to ' + normalizedEmail + ': ' + code + ' (' + type + ')');
        res.json({ success: true, message: 'Код отправлен на ' + normalizedEmail });

    } catch (error) {
        console.error('[AUTH] Send code error:', error.message);
        res.status(500).json({ error: 'Ошибка отправки письма: ' + error.message });
    }
});

// --- Verify code ---
app.post('/api/auth/verify-code', (req, res) => {
    try {
        const { email, code, name } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const stored = verificationCodes.get(normalizedEmail);
        if (!stored) {
            return res.status(400).json({ error: 'Код не найден. Запросите новый' });
        }

        if (Date.now() > stored.expires) {
            verificationCodes.delete(normalizedEmail);
            return res.status(400).json({ error: 'Код истёк. Запросите новый' });
        }

        stored.attempts++;
        if (stored.attempts > 5) {
            verificationCodes.delete(normalizedEmail);
            return res.status(400).json({ error: 'Слишком много попыток. Запросите новый код' });
        }

        if (stored.code !== code) {
            return res.status(400).json({ error: 'Неверный код. Осталось попыток: ' + (5 - stored.attempts) });
        }

        verificationCodes.delete(normalizedEmail);

        var users = getUsers();
        var user;

        if (stored.type === 'register') {
            user = {
                id: crypto.randomUUID(),
                email: normalizedEmail,
                name: name || normalizedEmail.split('@')[0],
                avatar: null,
                telegramId: null,
                telegramUsername: null,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
            console.log('[AUTH] New user registered: ' + normalizedEmail);
        } else {
            user = findUserByEmail(normalizedEmail);
            user.lastLogin = new Date().toISOString();
            users = users.map(function(u) { return u.email === normalizedEmail ? user : u; });
            saveUsers(users);
            console.log('[AUTH] User logged in: ' + normalizedEmail);
        }

        var token = generateToken(user);
        res.json({
            success: true,
            token: token,
            user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
        });

    } catch (error) {
        console.error('[AUTH] Verify error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// --- Telegram Login ---
app.post('/api/auth/telegram', (req, res) => {
    try {
        const data = req.body;
        const hash = data.hash;
        const checkData = Object.assign({}, data);
        delete checkData.hash;

        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        const checkString = Object.keys(checkData).sort().map(function(k) { return k + '=' + checkData[k]; }).join('\n');
        const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        if (hmac !== hash) {
            return res.status(403).json({ error: 'Telegram verification failed' });
        }

        if (Date.now() / 1000 - data.auth_date > 3600) {
            return res.status(403).json({ error: 'Telegram auth expired' });
        }

        var users = getUsers();
        var user = findUserByTelegramId(data.id);

        if (!user) {
            user = {
                id: crypto.randomUUID(),
                email: null,
                name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'User',
                avatar: data.photo_url || null,
                telegramId: data.id,
                telegramUsername: data.username || null,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
            console.log('[AUTH] New Telegram user: @' + data.username);
        } else {
            user.name = [data.first_name, data.last_name].filter(Boolean).join(' ') || user.name;
            user.avatar = data.photo_url || user.avatar;
            user.lastLogin = new Date().toISOString();
            users = users.map(function(u) { return u.id === user.id ? user : u; });
            saveUsers(users);
            console.log('[AUTH] Telegram login: @' + data.username);
        }

        var token = generateToken(user);
        res.json({
            success: true,
            token: token,
            user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
        });

    } catch (error) {
        console.error('[AUTH] Telegram error:', error);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

// --- Get profile ---
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = getUsers().find(function(u) { return u.id === req.user.id; });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, telegramUsername: user.telegramUsername }
    });
});

// --- Logout ---
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
});

// ============================================
// FALLBACK
// ============================================
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('  ======================================');
    console.log('       CryptoFlow Server Running');
    console.log('       http://localhost:' + PORT);
    console.log('  ======================================');
    console.log('  Email Auth    : Ready');
    console.log('  Telegram Auth : Ready');
    console.log('  Static Files  : Serving');
    console.log('  ======================================');
    console.log('');
});
