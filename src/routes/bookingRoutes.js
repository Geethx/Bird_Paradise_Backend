import express from 'express';
import {
  createBooking,
  getAllBookings,
  cancelBooking,
  confirmBooking,
  rejectBooking,
  getMyBookings,
} from '../controllers/bookingController.js';
import { authenticateAdmin, authenticateGuest } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateGuest, createBooking);

router.get('/my-bookings', authenticateGuest, getMyBookings);

router.get('/', authenticateAdmin, getAllBookings);

router.patch('/:id/cancel', authenticateGuest, cancelBooking);

router.patch('/:id/confirm', authenticateAdmin, confirmBooking);

router.patch('/:id/reject', authenticateAdmin, rejectBooking);



export default router;
