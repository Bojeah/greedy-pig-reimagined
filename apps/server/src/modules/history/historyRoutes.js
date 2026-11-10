import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({ matches: [] });
});

router.get('/:userId', requireAuth, (req, res) => {
  res.json({ userId: req.params.userId, matches: [] });
});

router.get('/', requireAuth, (req, res) => {
  res.json({ matches: [] });
});

export default router;
