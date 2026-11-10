import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { parseOrThrow } from '../../middleware/validate.js';
import { normaliseCode } from './roomCodes.js';
import { createRoom, getRoom } from './roomStore.js';
import { publicRoomInfo } from './publicState.js';

const settingsSchema = z.object({
  targetScore: z.coerce
    .number({ invalid_type_error: 'Target score must be a number.' })
    .int('Target score must be a whole number.')
    .min(25, 'Target score must be between 25 and 200.')
    .max(200, 'Target score must be between 25 and 200.')
    .default(100),
  maxPlayers: z.coerce
    .number({ invalid_type_error: 'Players must be a number.' })
    .int('Players must be a whole number.')
    .min(2, 'A room holds 2 to 4 players.')
    .max(4, 'A room holds 2 to 4 players.')
    .default(2),
  turnSeconds: z.coerce
    .number({ invalid_type_error: 'Turn time must be a number.' })
    .int('Turn time must be a whole number.')
    .min(15, 'Turn time must be between 15 and 60 seconds.')
    .max(60, 'Turn time must be between 15 and 60 seconds.')
    .default(30),
});

const router = Router();

router.post('/', requireAuth, (req, res) => {
  const settings = parseOrThrow(settingsSchema, req.body);
  const room = createRoom({ hostId: req.user.id, settings });
  res.status(201).json({ code: room.code });
});

router.get('/:code', requireAuth, (req, res) => {
  const room = getRoom(normaliseCode(req.params.code));
  if (!room) throw new AppError(404, 'ROOM_NOT_FOUND', 'No room with that code.');
  res.json(publicRoomInfo(room));
});

export default router;
