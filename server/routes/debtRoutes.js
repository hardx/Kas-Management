import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM debts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, person_name, total_amount, description, due_date } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO debts (id, user_id, type, person_name, total_amount, description, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, type, person_name, total_amount, description, due_date]
    );
    res.status(201).json({ message: 'Debt created', id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { type, person_name, total_amount, paid_amount, description, due_date, status } = req.body;
    await pool.query(
      'UPDATE debts SET type=?, person_name=?, total_amount=?, paid_amount=?, description=?, due_date=?, status=? WHERE id=? AND user_id=?',
      [type, person_name, total_amount, paid_amount, description, due_date, status, req.params.id, req.user.id]
    );
    res.json({ message: 'Debt updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM debts WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
