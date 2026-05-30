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
