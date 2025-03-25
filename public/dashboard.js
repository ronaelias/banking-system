let userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = "log.html"; // Redirect to login if not authenticated
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('user-name').innerText = localStorage.getItem('username');
    updateBalance();
});

async function updateBalance() {
    const response = await fetch(`http://localhost:5000/balance/${userId}`);
    const data = await response.json();

    if (typeof data.balance !== 'number') {
        console.error("Invalid balance received:", data.balance);
        document.getElementById('balance').innerText = "$0.00";
        return;
    }

    document.getElementById('balance').innerText = `$${data.balance.toFixed(2)}`;
    loadTransactions();
}

async function loadTransactions() {
    const selectedDate = document.getElementById('transaction-date').value;
    if (!selectedDate) return;

    const response = await fetch(`http://localhost:5000/transactions/${userId}?date=${selectedDate}`);
    const data = await response.json();
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    data.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');
        li.innerHTML = `
            <div>
                <strong>${transaction.description}</strong> <br>
                <small>${new Date(transaction.transaction_date).toLocaleTimeString()}</small>
            </div>
            <div>${transaction.amount > 0 ? `<span class="income">+${transaction.amount}</span>` : `<span class="expense">${transaction.amount}</span>`}</div>
        `;
        transactionList.appendChild(li);
    });
}

// Ensure the date picker doesn't allow selecting future dates
document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').setAttribute('max', today);
    document.getElementById('transaction-date').value = today; // Default to today
    loadTransactions();
});

async function addFunds() {
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    await fetch(`http://localhost:5000/updateBalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, description })
    });

    updateBalance();
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
}

async function removeFunds() {
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/updateBalance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount: -amount, description })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400) {
                alert(errorData.message || "Insufficient funds! You cannot withdraw more than your available balance.");
            } else {
                alert("An error occurred. Please try again.");
            }
            return;
        }

        updateBalance();
        document.getElementById('amount').value = '';
        document.getElementById('description').value = '';
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to process the transaction. Please try again later.");
    }
}

function goToChartPage() {
    window.location.href = "chart.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "log.html";
}
