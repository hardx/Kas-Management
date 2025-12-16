import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, 
             c.id as cat_id, c.name as cat_name, c.color as cat_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ? 
      ORDER BY t.transaction_date DESC
    `, [req.user.id]);

    // Format response to match expected frontend structure (nested categories)
    const formattedRows = rows.map(row => ({
      ...row,
      categories: row.category_id ? {
        id: row.cat_id,
        name: row.cat_name,
        color: row.cat_color
      } : null
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, description, type, category_id, transaction_date } = req.body;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO transactions (id, user_id, amount, description, type, category_id, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, amount, description, type, category_id || null, transaction_date]
    );

    res.status(201).json({ message: 'Transaction created', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { amount, description, type, category_id, transaction_date } = req.body;
    const { id } = req.params;

    await pool.query(
      'UPDATE transactions SET amount=?, description=?, type=?, category_id=?, transaction_date=? WHERE id=? AND user_id=?',
      [amount, description, type, category_id || null, transaction_date, id, req.user.id]
    );

    res.json({ message: 'Transaction updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
