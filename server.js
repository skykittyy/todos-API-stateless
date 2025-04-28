const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// === SQLite setup ===
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Connected to SQLite database.');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'low',
    isComplete INTEGER DEFAULT 0,
    isFun INTEGER DEFAULT 1
  )
`);

// GET all todos
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET todo by ID
app.get('/todos/:id', (req, res) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Todo item not found' });
    res.json(row);
  });
});

// POST a new todo
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun = true } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  const isFunVal = isFun === true || isFun === 'true' ? 1 : 0;

  db.run(
    `INSERT INTO todos (name, priority, isComplete, isFun) VALUES (?, ?, 0, ?)`,
    [name, priority, isFunVal],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        name,
        priority,
        isComplete: 0,
        isFun: isFunVal
      });
    }
  );
});

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Todo item not found' });
    res.json({ message: `Todo item ${req.params.id} deleted.` });
  });
});

// RESET all todos (⚠️ Dev tool)
app.post('/reset', (req, res) => {
  db.run('DELETE FROM todos', [], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Reset the AUTOINCREMENT sequence
    db.run('DELETE FROM sqlite_sequence WHERE name = "todos"', [], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All todos cleared. ID reset to 1.' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
