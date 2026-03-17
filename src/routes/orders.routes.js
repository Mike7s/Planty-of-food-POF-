const express = require("express");
const pool = require("../db");
const router = express.Router();

router.post('/', async (req, res) => {
  let conn;

  try {
    const userId = Number(req.body.user_id);
    const products = req.body.products;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: 'Inserire un id valido' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Elenco prodotti non valido' });
    }

    for (const p of products) {
      const productId = Number(p.product_id);
      const quantity = Number(p.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ message: 'Product_id non valido' });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity non valida' });
      }
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [userRows] = await conn.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    for (const p of products) {
      const productId = Number(p.product_id);

      const [productRows] = await conn.query(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );

      if (productRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `Prodotto con id ${productId} non trovato` });
      }
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id) VALUES (?)',
      [userId]
    );

    const orderId = orderResult.insertId;

    for (const p of products) {
      const productId = Number(p.product_id);
      const quantity = Number(p.quantity);

      await conn.query(
        'INSERT INTO order_products (order_id, product_id, quantity) VALUES (?, ?, ?)',
        [orderId, productId, quantity]
      );
    }

    await conn.commit();

    return res.status(201).json({
      id: orderId
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("ERRORE POST /orders:", err);
    return res.status(500).json({ message: 'Errore nel server' });
  } finally {
    if (conn) conn.release();
  }
});

router.delete('/:id', async (req, res) => {
  let conn;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Id non valido' })
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT id FROM orders WHERE id = ? ', [id]);
    if (rows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ message: 'Ordine non trovato' })
    }


    await conn.query('DELETE FROM order_products WHERE order_id =?', [id]);
    await conn.query('DELETE FROM orders WHERE id = ?', [id]);

    await conn.commit();
    return res.status(200).json({ message: 'Ordine eliminato con successo' })

  } catch (err) {
    if (conn) await conn.rollback()
    return res.status(500).json({ message: 'Errore nel server' });

  } finally { if (conn) conn.release(); }

})

router.put('/:id', async (req, res) => {
  let conn;
  try {

    const id = Number(req.params.id);
    const { user_id, products } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Id non valido' });
    }

    if (!Number.isInteger(user_id) || user_id <= 0) {
      return res.status(400).json({ message: 'User id  non valido ' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Prodotto non trovato' });
    }

    for (const p of products) {
      const productId = Number(p.product_id);
      const quantity = Number(p.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ message: 'Prodotto non trovato' })
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantità errata' })
      }
    }


    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [orderRows] = await conn.query('SELECT id FROM orders WHERE id= ?', [id])
    if (orderRows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ message: 'Ordine non trovato' })
    }

    const [userRows] = await conn.query('SELECT id FROM users WHERE id = ? ', [user_id])
    if (userRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Utente non trovato' })
    }

    for (const p of products) {
      const product_id = Number(p.product_id);

      const [productRows] = await conn.query('SELECT id FROM products WHERE id= ?', [product_id])
      if (productRows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: 'Prodotto non trovato' });
      }
    }

    await conn.query('UPDATE orders SET user_id =?  WHERE id =?', [user_id, id]);

    await conn.query('DELETE FROM order_products WHERE order_id = ? ', [id])
    for (const p of products) {

      const productId = Number(p.product_id);
      const quantity = Number(p.quantity)

      await conn.query('INSERT INTO order_products(order_id,product_id,quantity) VALUES(?,?,?)', [id, productId, quantity])

    }

    await conn.commit()
    return res.status(200).json({ message: 'Ordine aggiornato', id, user_id, products })

  } catch (err) {
    if (conn) await conn.rollback();
    return res.status(500).json({ message: 'Errore nel server' })
  } finally {
    if (conn) conn.release();

  }
})




router.get("/", async (req, res) => {
  const date = req.query.date;
  const product = req.query.product;

  let conn;

  try {
    conn = await pool.getConnection();

    let query = `
      SELECT
        orders.id AS order_id,
        orders.created_at,
        users.id AS user_id,
        users.nome AS user_nome,
        users.cognome AS user_cognome,
        users.email AS user_email,
        products.id AS product_id,
        products.nome AS product_nome,
        order_products.quantity
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN order_products ON order_products.order_id = orders.id
      JOIN products ON order_products.product_id = products.id
    `;

    const conditions = [];
    const params = [];

    if (date) {
      conditions.push("DATE(orders.created_at) = ?");
      params.push(date);
    }

    if (product) {
      conditions.push("products.nome = ?");
      params.push(product);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY orders.created_at DESC";

    const [rows] = await conn.query(query, params);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Errore nel server" });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;



module.exports = router;