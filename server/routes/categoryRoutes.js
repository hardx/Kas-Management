import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    const id = uuidv4();
    await pool.query('INSERT INTO categories (id, user_id, name, type, color) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, name, type, color]);
    res.status(201).json({ message: 'Category created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    await pool.query('UPDATE categories SET name=?, type=?, color=? WHERE id=? AND user_id=?', [name, type, color, req.params.id, req.user.id]);
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
