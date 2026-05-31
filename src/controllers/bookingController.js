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


export async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);


    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.guest_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This is not your booking.' });
    }

    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    booking.booking_status = 'cancelled';
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, { availability_status: true });

    res.status(200).json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Something went wrong, please try again.', error: error.message });
  }
}

export async function confirmBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({
        message: `Booking cannot be confirmed. Current status: ${booking.booking_status}`,
      });
    }

    booking.booking_status = 'confirmed';
    await booking.save();

    res.status(200).json({ message: 'Booking confirmed successfully.', booking });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Something went wrong, please try again.', error: error.message });
  }
}


export async function rejectBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.booking_status === 'rejected' || booking.booking_status === 'cancelled') {
      return res.status(400).json({
        message: `Booking cannot be rejected. Current status: ${booking.booking_status}`,
      });
    }

    booking.booking_status = 'rejected';
    await booking.save();

    await Room.findByIdAndUpdate(booking.room_id, { availability_status: true });

    res.status(200).json({ message: 'Booking rejected successfully.', booking });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Something went wrong, please try again.', error: error.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const myBookings = await Booking.find({ guest_id:req.user.id })
      .populate("room_id", "room_number room_type price");

    res.status(200).json({ bookings: myBookings });
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    res.status(500).json({ message: "Something went wrong, please try again.", error: error.message });
  }
}