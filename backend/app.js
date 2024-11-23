const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ExcelJS = require('exceljs');
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

// Route to generate expense report in Excel
app.get('/expense-report', async (req, res) => {
  const { startDate, endDate, minAmount, maxAmount, person } = req.query;

  try {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (minAmount) {
      query += ' AND amount >= ?';
      params.push(minAmount);
    }

    if (maxAmount) {
      query += ' AND amount <= ?';
      params.push(maxAmount);
    }

    if (person) {
      query += ' AND json_extract(people, "$[*].name") LIKE ?';
      params.push(`%${person}%`);
    }

    const expenses = await db.all(query, params);

    if (expenses.length === 0) {
      return res.status(404).send('No expenses found for the given criteria');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    worksheet.columns = [
      { header: 'Expense Name', key: 'expenseName', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'People', key: 'people', width: 30 },
      { header: 'Recurring', key: 'isRecurring', width: 10 },
      { header: 'Recurring Day', key: 'recurringDay', width: 15 },
    ];

    expenses.forEach((expense) => {
      worksheet.addRow({
        expenseName: expense.expenseName,
        amount: `£${expense.amount.toLocaleString()}`,
        date: expense.date,
        description: expense.description,
        people: expense.people,
        isRecurring: expense.isRecurring ? 'Yes' : 'No',
        recurringDay: expense.recurringDay,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating expense report:', err);
    res.status(500).send('Failed to generate expense report');
  }
});

// Route to fetch filter options
app.get('/filter-options', async (req, res) => {
  try {
    const people = await db.all('SELECT DISTINCT json_extract(value, "$.name") as name FROM expenses, json_each(people)');
    const dateRange = await db.get('SELECT MIN(date) as minDate, MAX(date) as maxDate FROM expenses');
    res.json({ people, dateRange });
  } catch (err) {
    res.status(500).send('Failed to retrieve filter options');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});