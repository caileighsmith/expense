const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Create and connect to the SQLite database
let db;
(async () => {
  db = await sqlite.open({
    filename: 'expenses.db',
    driver: sqlite3.Database
  });

  // Create the expenses table
  await db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expenseName TEXT,
    amount REAL,
    date TEXT,
    description TEXT,
    people TEXT,
    isRecurring INTEGER,
    recurringDay INTEGER
  )`);
})();

// Route for handling expenses
app.post('/expense', async (req, res) => {
  const { expenseName, amount, date, description, people, isRecurring, recurringDay } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO expenses (expenseName, amount, date, description, people, isRecurring, recurringDay) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [expenseName, amount, date, description, JSON.stringify(people), isRecurring ? 1 : 0, recurringDay]
    );
    res.status(201).send(`Expense created with ID: ${result.lastID}`);
  } catch (err) {
    res.status(500).send('Failed to create expense');
  }
});

// Route to fetch and display all expenses
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await db.all('SELECT * FROM expenses');
    console.log(expenses);
    res.json(expenses);
  } catch (err) {
    res.status(500).send('Failed to retrieve expenses');
  }
});

// Route to update an expense
app.patch('/expense/:id', async (req, res) => {
  const { id } = req.params;
  const { expenseName, amount, date, description, people, isRecurring, recurringDay } = req.body;

  try {
    const result = await db.run(
      `UPDATE expenses SET expenseName = ?, amount = ?, date = ?, description = ?, people = ?, isRecurring = ?, recurringDay = ? WHERE id = ?`,
      [expenseName, amount, date, description, JSON.stringify(people), isRecurring ? 1 : 0, recurringDay, id]
    );

    if (result.changes === 0) {
      res.status(404).send('Expense not found');
    } else {
      res.status(200).send('Expense updated successfully');
    }
  } catch (err) {
    res.status(500).send('Failed to update expense');
  }
});

// Route to delete an expense
app.delete('/expense/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.run(`DELETE FROM expenses WHERE id = ?`, id);

    if (result.changes === 0) {
      res.status(404).send('Expense not found');
    } else {
      res.status(200).send('Expense deleted successfully');
    }
  } catch (err) {
    res.status(500).send('Failed to delete expense');
  }
});

// Route to fetch all unique people
app.get('/people', async (req, res) => {
  try {
    const people = await db.all('SELECT DISTINCT json_extract(value, "$.name") as name FROM expenses, json_each(people)');
    res.json(people);
  } catch (err) {
    res.status(500).send('Failed to retrieve people');
  }
});

// Route to fetch expenses for a specific person
app.get('/expenses/person/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const expenses = await db.all(
      `SELECT * FROM expenses WHERE json_extract(people, "$[*].name") LIKE ?`,
      [`%${name}%`]
    );
    res.json(expenses);
  } catch (err) {
    res.status(500).send('Failed to retrieve expenses for person');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});