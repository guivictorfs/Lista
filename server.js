const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

app.use(express.json());
app.use(express.static('.'));

db.serialize(() => {
    db.run("CREATE TABLE tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT UNIQUE, custo REAL, data_limite DATE, ordem INTEGER UNIQUE)");
});

app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tarefas ORDER BY ordem", [], (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });
});

app.post('/tasks', (req, res) => {
    const { nome, custo, data_limite } = req.body;
    db.run("INSERT INTO tarefas (nome, custo, data_limite, ordem) VALUES (?, ?, ?, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM tarefas))", [nome, custo, data_limite], err => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/tasks/:id', (req, res) => {
    const { nome, custo, data_limite } = req.body;
    const id = req.params.id;
    db.run("UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?", [nome, custo, data_limite, id], err => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM tarefas WHERE id = ?", [id], err => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
