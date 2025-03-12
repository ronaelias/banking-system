const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'banking_system'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected...');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username already exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        res.send({ success: false, message: 'Username already exists' });
      } else {
        // Insert new user into the database
        const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(insertUserQuery, [username, password], (err, results) => {
          if (err) throw err;
          res.send({ success: true, message: 'User registered successfully' });
        });
      }
    });
  });

// Routes
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.send({ success: true, userId: results[0].id });
    } else {
      res.send({ success: false });
    }
  });
});

app.post('/updateBalance', (req, res) => {
  const { userId, amount, description } = req.body;

  console.log("Received updateBalance request:", req.body); // Debugging

  if (!userId || isNaN(amount) || !description) {
      console.error("Invalid input data:", { userId, amount, description });
      return res.status(400).send({ success: false, message: "Invalid input data." });
  }

  const getBalanceQuery = 'SELECT balance FROM users WHERE id = ?';

  db.query(getBalanceQuery, [userId], (err, results) => {
      if (err) {
          console.error("Balance Fetch Error:", err);
          return res.status(500).send({ success: false, message: "Error fetching balance." });
      }

      if (results.length === 0) {
          console.error("User not found:", userId);
          return res.status(400).send({ success: false, message: "User not found." });
      }

      const currentBalance = parseFloat(results[0].balance) || 0; // Parse balance as a number
      console.log("Current Balance:", currentBalance); // Debugging

      // Prevent balance from going negative
      if (amount < 0 && Math.abs(amount) > currentBalance) {
          console.warn("Insufficient funds for user:", userId);
          return res.status(400).send({ success: false, message: "Insufficient balance!" });
      }

      const insertTransactionQuery = 'INSERT INTO transactions (user_id, amount, description) VALUES (?, ?, ?)';
      const updateBalanceQuery = 'UPDATE users SET balance = ? WHERE id = ?';

      // Insert transaction first
      db.query(insertTransactionQuery, [userId, amount, description], (err, results) => {
          if (err) {
              console.error("Transaction Insert Error:", err);
              return res.status(500).send({ success: false, message: "Transaction insert failed." });
          }

          // Calculate the new balance
          const newBalance = currentBalance + amount;
          console.log("New Balance Calculated:", newBalance); // Debugging

          // Update balance in users table
          db.query(updateBalanceQuery, [newBalance, userId], (err, results) => {
              if (err) {
                  console.error("Balance Update Error:", err);
                  return res.status(500).send({ success: false, message: "Balance update failed." });
              }

              // Fetch updated balance and return it
              db.query(getBalanceQuery, [userId], (err, results) => {
                  if (err) {
                      console.error("Balance Fetch Error After Update:", err);
                      return res.status(500).send({ success: false, message: "Error fetching updated balance." });
                  }
                  res.send({ success: true, message: "Transaction successful!", newBalance: results[0].balance });
              });
          });
      });
  });
});

app.get('/balance/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT IFNULL(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Balance Fetch Error:", err);
            return res.status(500).send({ success: false, message: "Database error" });
        }
        res.send({ balance: Number(results[0].balance) || 0 });
    });
});

// ✅ Redirect root URL to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => {
  console.log('✅ Server running on PORT 5000'); 
});

app.get('/transactions/:userId', (req, res) => {
  const userId = req.params.userId;
  const selectedDate = req.query.date;

  if (!selectedDate) {
      return res.status(400).send({ success: false, message: "Date is required" });
  }

  const query = 'SELECT * FROM transactions WHERE user_id = ? AND DATE(transaction_date) = ? ORDER BY transaction_date DESC';

  db.query(query, [userId, selectedDate], (err, results) => {
      if (err) {
          console.error("Error fetching transactions:", err);
          return res.status(500).send({ success: false, message: "Database error" });
      }
      res.send({ transactions: results });
  });
});