import express from 'express';
import { createRoom, getAllRooms } from '../controllers/roomController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRooms);
router.post('/', authenticateAdmin, createRoom);

export default router;