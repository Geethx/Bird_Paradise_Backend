import express from 'express';
import { loginGuest, registerGuest } from '../controllers/guestController.js';

const router = express.Router();

router.post('/register', registerGuest);
router.post('/login', loginGuest);


export default router;