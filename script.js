const form = document.getElementById('registerForm');
const nickname = document.getElementById('nickname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');

// Проверка ника
let nicknameTimer;
let isNicknameValid = false;

nickname.addEventListener('input', () => {
    clearTimeout(nicknameTimer);
    const value = nickname.value.trim();
    const error = document.getElementById('nicknameError');
    
    isNicknameValid = false;
    
    if (value.length < 3) {
        setError(nickname, error, 'Минимум 3 символа');
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        setError(nickname, error, 'Только латиница, цифры и _');
        return;
    }
    
    nicknameTimer = setTimeout(() => checkNickname(value), 600);
});

async function checkNickname(nick) {
    const error = document.getElementById('nicknameError');
    
    try {
        const response = await fetch(`/api/check-nickname?nickname=${encodeURIComponent(nick)}`);
        const data = await response.json();
        
        if (data.taken) {
            setError(nickname, error, 'Этот ник уже занят');
            isNicknameValid = false;
        } else {
            error.textContent = '✓ Ник свободен';
            error.style.color = '#10b981';
            nickname.classList.add('valid');
            nickname.classList.remove('invalid');
            isNicknameValid = true;
        }
    } catch (err) {
        console.error(err);
        isNicknameValid = true;
    }
}


// Проверка пароля
password.addEventListener('input', () => {
    const value = password.value;
    const error = document.getElementById('passwordError');
    
    if (value.length < 8) {
        setError(password, error, 'Минимум 8 символов');
    } else {
        setSuccess(password, error);
    }
    
    if (confirmPassword.value) checkPasswordMatch();
});

// Совпадение паролей
confirmPassword.addEventListener('input', checkPasswordMatch);

function checkPasswordMatch() {
    const error = document.getElementById('confirmError');
    if (password.value !== confirmPassword.value) {
        setError(confirmPassword, error, 'Пароли не совпадают');
    } else if (confirmPassword.value.length > 0) {
        setSuccess(confirmPassword, error);
    }
}

function setError(input, errorEl, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    errorEl.textContent = message;
    errorEl.style.color = '#ef4444';
}

function setSuccess(input, errorEl) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorEl.textContent = '';
}

// Отправка формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isNicknameValid) {
        nickname.dispatchEvent(new Event('input'));
        await new Promise(r => setTimeout(r, 700));
        if (!isNicknameValid) {
            alert('Проверьте никнейм');
            return;
        }
    }
    
    email.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
    checkPasswordMatch();
    
    if (document.querySelectorAll('.invalid').length > 0) {
        alert('Исправьте ошибки в форме');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Создание аккаунта...';

    const userData = {
        nickname: nickname.value.trim(),
        email: email.value.trim(),
        password: password.value
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка регистрации');
        }

        document.getElementById('successModal').classList.add('active');
        localStorage.setItem('mc_nickname', userData.nickname);
        
    } catch (error) {
        alert('❌ ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зарегистрироваться';
    }
});

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
    form.reset();
    document.querySelectorAll('input').forEach(inp => {
        inp.classList.remove('valid', 'invalid');
    });
    document.getElementById('nicknameError').textContent = '';
}

// Онлайн сервера
async function updateOnline() {
    try {
        const response = await fetch('/api/server-status');
        const data = await response.json();
        document.getElementById('onlineCount').textContent = data.online;
    } catch {
        document.getElementById('onlineCount').textContent = '?';
    }
}

updateOnline();
setInterval(updateOnline, 30000);