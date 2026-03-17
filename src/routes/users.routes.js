const express = require("express");
const pool = require("../db");
const router = express.Router();

router.post('/', async (req, res) => {

    try {

        const { nome, cognome, email } = req.body;

        if (typeof nome !== 'string') {
            return res.status(400).json({ message: 'Nome non valido' });
        }

        if (typeof cognome !== 'string') {
            return res.status(400).json({ message: 'Cognome non valido' })
        }

        if (typeof email !== 'string') {
            return res.status(400).json({ message: 'Email non valida' })
        }

        const user = {
            nome: nome?.trim(),
            cognome: cognome?.trim(),
            email: email?.trim()
        }

        if (!user.nome || user.nome.length < 2) {
            return res.status(400).json({ message: 'Nome non valido' })
        }

        if (!user.cognome || user.cognome.length < 2) {
            return res.status(400).json({ message: 'Cognome non valido' })
        }

        if (!user.email || !user.email.includes('@')) {
            return res.status(400).json({ message: 'Email non valida' });
        }

        const [result] = await pool.query('INSERT INTO users (nome,cognome,email) VALUES (?,?,?)', [user.nome, user.cognome, user.email])


        return res.status(201).json({ id: result.insertId, nome: user.nome, cognome: user.cognome, email: user.email });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: 'Utente già esistente ' })
        }
        return res.status(500).json({ message: 'Errore nel server' });
    }

})



router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: 'id non valido' })
        }

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id])

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utente non trovato ' })
        }

        return res.status(200).json({ message: 'Utente cancellato con successo!' })

    } catch (err) {
        return res.status(500).json({ message: 'Errore nel server' });
    }
})


router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: 'Id non valido' });
        }
        const [rows] = await pool.query('SELECT id,nome,cognome,email FROM users WHERE id = ?', [id])
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Utente non trovato' })
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        return res.status(500).json({ message: 'Errore nel server' });
    }
}
)

router.put('/:id', async (req, res) => {
    try {

        const id = Number(req.params.id)
        const { nome, cognome, email } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: 'Id non valido' })
        }

        if (typeof nome !== 'string') {
            return res.status(400).json({ message: 'Nome non valido' })
        }

        if (typeof cognome !== 'string') {
            return res.status(400).json({ message: 'Cognome non valido' })
        }
        if (typeof email !== 'string') {
            return res.status(400).json({ message: 'Email non valida' })
        }

        const user = {
            nome: nome?.trim(),
            cognome: cognome?.trim(),
            email: email?.trim()
        }

        if (!user.nome || user.nome.length < 2) {
            return res.status(400).json({ message: 'Nome non valido' })
        }

        if (!user.cognome || user.cognome.length < 2) {
            return res.status(400).json({ message: 'Cognome non valido' })
        }

        if (!user.email || !user.email.includes('@')) {
            return res.status(400).json({ message: 'Email non valida' })
        }



        const [result] = await pool.query('UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ? ', [user.nome, user.cognome, user.email, id])
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        return res.status(200).json({ id, nome: user.nome, cognome: user.cognome, email: user.email });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: 'Utente già esistente' })
        }
        return res.status(500).json({ message: 'Errore nel server' });

    }
})

module.exports = router;