let userId = null;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch(`http://localhost:8000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        userId = data.userId;
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);

        // ✅ Redirect to Dashboard
        window.location.href = "http://127.0.0.1:8000/dashboard.html";
    } else {
        alert('Invalid credentials');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const response = await fetch(`http://localhost:8000/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        alert('Registration successful! Please login.');
        showLogin();
    } else {
        alert(data.message || 'Registration failed');
    }
}

function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

function showLogin() {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}
