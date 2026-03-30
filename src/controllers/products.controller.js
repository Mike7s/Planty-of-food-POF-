const pool = require("../db");

const createProduct = async (req, res) => {
  try {
    const nome = req.body.nome;

    if (typeof nome !== "string") {
      return res.status(400).json({ message: "Nome non valido" });
    }

    const cleanNome = nome.trim();

    if (!cleanNome || cleanNome.length < 2) {
      return res.status(400).json({ message: "Nome non valido" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (nome) VALUES (?)",
      [cleanNome]
    );

    return res.status(201).json({
      id: result.insertId,
      nome: cleanNome
    });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Nome già esistente" });
    }

    return res.status(500).json({ message: "Errore nel server" });
  }
};

const deleteProduct = async (req, res) => {
  try {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Id non valido' })
    }

    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }
    return res.status(200).json({ message: 'Prodotto eliminato' })

  } catch (err) {
    return res.status(500).json({ message: 'Errore nel server' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nome = req.body.nome;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Id non valido' })
    }

    if (typeof nome !== 'string') {
      return res.status(400).json({ message: 'nome non valido' })
    }

    const cleanNome = nome.trim();
    if (!cleanNome || cleanNome.length < 2) {
      return res.status(400).json({ message: 'Nome non valido' });
    }

    const [result] = await pool.query('UPDATE products SET nome = ? WHERE id = ?', [cleanNome, id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prodotto non trovato' })
    }
    return res.status(200).json({ id, nome: cleanNome })

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: 'Nome già esistente' })
    }
    return res.status(500).json({ message: 'Errore nel server' })
  }
}



