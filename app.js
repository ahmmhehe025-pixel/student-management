
const express = require('express');
const mysql = require('mysql2');

const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_management'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }

    console.log('Connected to MySQL');
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// DISPLAY ALL STUDENTS
app.get('/', (req, res) => {
    db.query(
        'SELECT * FROM students ORDER BY id DESC',
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            res.render('index', { students: results });
        }
    );
});

// SHOW ADD STUDENT FORM
app.get('/students/add', (req, res) => {
    res.render('add');
});

// ADD STUDENT
app.post('/students/add', (req, res) => {
    const {
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email
    } = req.body;

    const sql = `
        INSERT INTO students
        (student_id, first_name, last_name, course, year_level, email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.error('Add error:', err);
            return res.status(500).send('Unable to save student');
        }

        res.redirect('/');
    });
});

// SEARCH STUDENTS
app.get('/students/search', (req, res) => {
    const keyword = req.query.keyword || '';
    const searchValue = `%${keyword}%`;

    const sql = `
        SELECT * FROM students
        WHERE student_id LIKE ?
           OR first_name LIKE ?
           OR last_name LIKE ?
           OR course LIKE ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [searchValue, searchValue, searchValue, searchValue],
        (err, results) => {
            if (err) {
                console.error('Search error:', err);
                return res.status(500).send('Search error');
            }

            res.render('index', { students: results });
        }
    );
});

// SHOW EDIT STUDENT FORM
app.get('/students/edit/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'SELECT * FROM students WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Edit query error:', err);
                return res.status(500).send('Database error');
            }

            if (results.length === 0) {
                return res.status(404).send('Student not found');
            }

            console.log('Student being edited:', results[0]);

            res.render('edit', {
                student: results[0]
            });
        }
    );
});

// SAVE EDITED STUDENT
app.post('/students/edit/:id', (req, res) => {
    const id = req.params.id;

    const {
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email
    } = req.body;

    const sql = `
        UPDATE students
        SET student_id = ?,
            first_name = ?,
            last_name = ?,
            course = ?,
            year_level = ?,
            email = ?
        WHERE id = ?
    `;

    const values = [
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).send('Unable to update student');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found');
        }

        res.redirect('/');
    });
});

// DELETE STUDENT
app.post('/students/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'DELETE FROM students WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).send('Unable to delete student');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Student not found');
            }

            console.log('Student deleted. Database ID:', id);

            res.redirect('/');
        }
    );
});

// START SERVER
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
