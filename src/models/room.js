import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: true,
    unique: true,
  },

  room_type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'family']
  },

  price: {
    type: Number,
    required: true,
  },

  images: {
    type: [String],
    default: [],
    required: true,
  },

  availability_status: {
    type: Boolean,
    default: true,
  },

});

const Room = mongoose.model("Room", roomSchema);
export default Room;