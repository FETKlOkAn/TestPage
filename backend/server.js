const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/questions', express.static(path.join(__dirname, 'questions_converted')));

const db = new Database('my-database.db');
db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, correct INTEGER, incorrect INTEGER)').run();

app.post('/newuser', (req, res, next) => {
    try {
        const { name, correct = 0, incorrect = 0 } = req.body;
        if (!name) {
            throw new Error('Name is required');
        }
        const stmt = db.prepare('INSERT INTO users (name, correct, incorrect) VALUES (?, ?, ?)');
        const info = stmt.run(name, correct, incorrect);
        res.send(`User created with ID: ${info.lastInsertRowid}`);
    } catch (error) {
        next(error);
    }
});

app.get('/users', (req, res) => {
    try {
        const stmt = db.prepare('SELECT name FROM users');
        const users = stmt.all();
        res.json(users);
    } catch (error) {
        res.status(500).send('Failed to get users');
    }
});

app.put('/users/positive/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('UPDATE users SET correct = correct + 1 WHERE id = ?');
        const info = stmt.run(id);
        res.send(`Updated ${info.changes} row(s)`);
    } catch (error) {
        res.status(500).send('Failed to update user');
    }
});


app.put('/users/negative/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('UPDATE users SET incorrect = incorrect + 1 WHERE id = ?');
        const info = stmt.run(id);
        res.send(`Updated ${info.changes} row(s)`);
    } catch (error) {
        res.status(500).send('Failed to update user');
    }
});

app.get('/api/questions/all', (req, res) => {
    try {
        const questionsList1 = require('./questions_converted/list1.json');
        const questionsList2 = require('./questions_converted/list2.json');
        const questionsList3 = require('./questions_converted/list3.json');
        const questionsList4 = require('./questions_converted/list4.json');

        const allQuestions = [...questionsList1, ...questionsList2, ...questionsList3, ...questionsList4];

        res.json(allQuestions);
    } catch (error) {
        console.error('Error loading questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

app.get('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Failed to get user');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
