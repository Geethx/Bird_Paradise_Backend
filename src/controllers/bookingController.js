import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

export async function createBooking(req, res) {
  try {
    const { check_in_date, check_out_date, guest_id, room_id } = req.body;

    const newBooking = new Booking({
      check_in_date,
      check_out_date,
      guest_id,
      room_id,
    });

    await newBooking.save();

    await Room.findByIdAndUpdate(room_id, { availability_status: false });

    res
      .status(201)
      .json({ message: "Booking created successfully!", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({
        message: "Something went wrong, please try again.",
        error: error.message,
      });
  }
}

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("guest_id", "name email phone")
      .populate("room_id", "room_number room_type price");
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({
        message: "Something went wrong, please try again.",
        error: error.message,
      });
  }
}

// ==========================================
// CANCEL BOOKING — Guest Only
// ==========================================
// Guest ට own booking cancel කරන්න බලය ලැබෙනවා.
// Cancel කරාම Room availability නැවත true වෙනවා.

export async function cancelBooking(req, res) {
  try {
    // 1. URL param එකෙන් booking ID ගන්නවා (:id)
    const booking = await Booking.findById(req.params.id);

    // 2. Booking exist නොකරයි නම්
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // 3. මේ booking belong වෙන්නේ logged-in guest ට ද check කරනවා
    //    req.user.id — middleware ගෙන් attach වෙලා ආවා
    if (booking.guest_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This is not your booking.' });
    }

    // 4. දැනටමත් cancelled නම් — error
    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // 5. Status update කරනවා
    booking.booking_status = 'cancelled';
    await booking.save();

    // 6. Room availability නැවත true (available) ට set කරනවා
    await Room.findByIdAndUpdate(booking.room_id, { availability_status: true });

    res.status(200).json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Something went wrong, please try again.', error: error.message });
  }
}

// ==========================================
// CONFIRM BOOKING — Admin Only
// ==========================================
// Admin ට pending booking confirm කිරීමේ බලය ලැබෙනවා.

export async function confirmBooking(req, res) {
  try {
    // 1. Booking ගන්නවා
    const booking = await Booking.findById(req.params.id);

    // 2. Exist නොකරයි නම්
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // 3. දැනටමත් confirmed හෝ cancelled නම් — error
    if (booking.booking_status !== 'pending') {
      return res.status(400).json({
        message: `Booking cannot be confirmed. Current status: ${booking.booking_status}`,
      });
    }

    // 4. Status "confirmed" ට update කරනවා
    booking.booking_status = 'confirmed';
    await booking.save();

    res.status(200).json({ message: 'Booking confirmed successfully.', booking });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Something went wrong, please try again.', error: error.message });
  }
}
