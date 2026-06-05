import express from 'express';
import { createRoom, getAllRooms, updateRoom, deleteRoom, searchAvailableRooms, updateAvailability } from '../controllers/roomController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/available', searchAvailableRooms);
router.post('/', authenticateAdmin, upload.array('images', 5), createRoom);
router.put('/:id', authenticateAdmin, upload.array('images', 5), updateRoom);
router.delete('/:id', authenticateAdmin, deleteRoom);
router.patch('/:id/availability', authenticateAdmin, updateAvailability)

export default router;