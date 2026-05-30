import Room from "../models/Room.js";

export async function createRoom(req, res) {
  try {
    const { room_number, room_type, price } = req.body;

    const existingRoom = await Room.findOne({ room_number });
    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists." });
    }

    const newRoom = new Room({
      room_number,
      room_type,
      price,
    });

    await newRoom.save();
    res
      .status(201)
      .json({ message: "Room created successfully!", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res
      .status(500)
      .json({
        message: "Something went wrong, please try again.",
        error: error.message,
      });
  }
}

export async function getAllRooms(req, res) {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    }catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Something went wrong, please try again.", error: error.message });
    }
}