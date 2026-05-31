import express from 'express';
import { loginGuest, registerGuest, getAllGuests } from '../controllers/guestController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerGuest);
router.post('/login', loginGuest);
router.get('/', authenticateAdmin, getAllGuests);

export default router;