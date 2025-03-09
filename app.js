let userId = null;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch(`http://localhost:5000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        userId = data.userId;
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        document.getElementById('login').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-name').innerText = username;
        updateBalance();
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

    const response = await fetch(`http://localhost:5000/register`, {
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

async function updateBalance() {
    const response = await fetch(`http://localhost:5000/balance/${userId}`);
    const data = await response.json();

    if (typeof data.balance !== 'number') {
        console.error("Invalid balance received:", data.balance);
        document.getElementById('balance').innerText = "0.00";
        return;
    }

    document.getElementById('balance').innerText = data.balance.toFixed(2);
    loadTransactions();
}

async function addFunds() {
    const userId = localStorage.getItem('userId'); // Retrieve userId
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const response = await fetch(`http://localhost:5000/updateBalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, description })
    });

    const data = await response.json();
    if (data.success) {
        updateBalance(); // Fetch and update balance

        // ✅ Clear input fields
        amountInput.value = '';
        descriptionInput.value = '';
    } else {
        alert(data.message || "Transaction failed!");
    }
}

async function removeFunds() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const response = await fetch(`http://localhost:5000/updateBalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: -amount, description })
    });

    const data = await response.json();
    if (data.success) {
        updateBalance(); // Fetch and update balance

        // ✅ Clear input fields
        amountInput.value = '';
        descriptionInput.value = '';
    } else {
        alert(data.message || "Transaction failed!");
    }
}

async function loadTransactions() {
    const response = await fetch(`http://localhost:5000/transactions/${userId}`);
    const data = await response.json();
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = ''; // Clear previous entries

    data.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');

        // Format Amount with Color
        let amountText = `$${Math.abs(transaction.amount).toFixed(2)}`;
        amountText = transaction.amount > 0 
            ? `<span class="income">+${amountText}</span>` 
            : `<span class="expense">-${amountText}</span>`;

        // Create Transaction List Item
        li.innerHTML = `
            <div>
                <strong>${transaction.description}</strong> <br>
                <small>${new Date(transaction.transaction_date).toLocaleString()}</small>
            </div>
            <div>${amountText}</div>
        `;

        transactionList.appendChild(li);
    });
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

function showLogin() {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}