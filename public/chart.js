let userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = "log.html";
}

async function fetchBalanceHistory() {
    const response = await fetch(`http://localhost:5000/balance-history/${userId}`);
    const data = await response.json();
    return data.history;
}

async function drawChart() {
    const balanceHistory = await fetchBalanceHistory();

    if (!balanceHistory || balanceHistory.length === 0) {
        alert("No transaction history found.");
        return;
    }

    console.log("Processed Balance History Data:", balanceHistory); // Debugging

    // Extract only dates (YYYY-MM-DD format) for labels
    const labels = balanceHistory.map(entry => new Date(entry.transaction_date).toLocaleDateString());

    const balances = balanceHistory.map(entry => entry.balance);

    // Plot the chart
    const ctx = document.getElementById('balanceChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Cumulative Balance Over Time",
                data: balances,
                borderColor: "blue",
                borderWidth: 2,
                fill: false,
                tension: 0.2 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Date" },
                    ticks: {
                        callback: function(value, index, values) {
                            return labels[index]; // Display only the date
                        }
                    }
                },
                y: {
                    title: { display: true, text: "Balance ($)" },
                    beginAtZero: false
                }
            }
        }
    });
}

function goBack() {
    window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", drawChart);