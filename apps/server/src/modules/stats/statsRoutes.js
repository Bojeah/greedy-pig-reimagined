import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json({
    userId: req.user.id,
    username: req.user.username,
    gamesPlayed: 0,
    wins: 0,
    highestTurnScore: 0,
    highestGameScore: 0,
    xp: 0,
    level: 1,
  });
});

export default router;
