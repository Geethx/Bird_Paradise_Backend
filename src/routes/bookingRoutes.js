import express from 'express';
import {
  createBooking,
  getAllBookings,
  cancelBooking,
  confirmBooking,
} from '../controllers/bookingController.js';
import { authenticateAdmin, authenticateGuest } from '../middleware/auth.js';

const router = express.Router();

// POST /bookings — Booking create කිරීම
// Guard: Guest token required (Guest විතරයි book කරන්නේ)
router.post('/', authenticateGuest, createBooking);

// GET /bookings — සියලු bookings බලන්නේ
// Guard: Admin token required (Admin විතරයි manage කරන්නේ)
router.get('/', authenticateAdmin, getAllBookings);

// PATCH /bookings/:id/cancel — Booking cancel කිරීම
// Guard: Guest token required (Guest ට own booking cancel කරන්නට)
router.patch('/:id/cancel', authenticateGuest, cancelBooking);

// PATCH /bookings/:id/confirm — Booking confirm කිරීම
// Guard: Admin token required (Admin විතරයි confirm කරන්නේ)
router.patch('/:id/confirm', authenticateAdmin, confirmBooking);

export default router;