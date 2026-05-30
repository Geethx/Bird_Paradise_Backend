import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  check_in_date: {
    type: Date,
    required: true,
  },
  check_out_date: {
    type: Date,
    required: true,
  },
  booking_status: {
    type: String,
    default: "Pending",
  },
  booking_date: {
    type: Date,
    default: Date.now,
  },

  guest_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: true,
  },

  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
