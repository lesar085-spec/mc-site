const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

const players = [];

app.get('/api/check-nickname', (req, res) => {
    const { nickname } = req.query;
    if (!nickname || !/^[a-zA-Z0-9_]{3,16}$/.test(nickname)) {
        return res.status(400).json({ error: 'Неверный формат ника' });
    }
    const existing = players.find(p => p.nickname === nickname);
    res.json({ taken: !!existing, premium: false });
});

app.post('/api/register', async (req, res) => {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(nickname)) {
        return res.status(400).json({ message: 'Неверный формат ника' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Пароль минимум 8 символов' });
    }

    try {
        if (players.find(p => p.nickname === nickname)) {
            return res.status(409).json({ message: 'Этот ник уже занят' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        players.push({ id: players.length + 1, nickname, passwordHash });

        console.log(`✅ Зарегистрирован: ${nickname} (всего: ${players.length})`);
        res.json({ success: true, message: 'Регистрация успешна', nickname });

    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/api/server-status', (req, res) => {
    res.json({ online: Math.floor(Math.random() * 50) + 10 });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});