import Room from "../models/room.js";
import Booking from "../models/booking.js";
import { createClient } from "@supabase/supabase-js";

export async function createRoom(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    const { room_number, room_type, price } = req.body;

    const existingRoom = await Room.findOne({ room_number });
    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists." });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {

        const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

        const { data, error } = await supabase.storage
          .from('hotel-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          console.error("Supabase Error:", error);
          throw new Error("Failed to upload image to Supabase");
        }

        const publicUrl = supabase.storage
          .from('hotel-images')
          .getPublicUrl(fileName).data.publicUrl;

        imageUrls.push(publicUrl);
      }
    }
    const newRoom = new Room({
      room_number,
      room_type,
      price,
      images: imageUrls,
    });

    await newRoom.save();

    res.status(201).json({ message: "Room created successfully!", room: newRoom });

  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      message: "Something went wrong, please try again.",
      error: error.message,
    });
  }
}


export async function getAllRooms(req, res) {
  try {
    const rooms = await Room.find().lean();


    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);


    const activeBookings = await Booking.find({
      booking_status: 'confirmed',
      check_in_date: { $lte: today },
      check_out_date: { $gt: today }
    });


    const occupiedRoomIds = new Set(activeBookings.map(b => b.room_id.toString()));


    const roomsWithStatus = rooms.map(room => ({
      ...room,
      is_occupied_today: occupiedRoomIds.has(room._id.toString())
    }));

    res.status(200).json(roomsWithStatus);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Something went wrong, please try again.", error: error.message });
  }
}


export async function updateRoom(req, res) {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, {
      room_number: req.body.room_number,
      room_type: req.body.room_type,
      price: req.body.price,
    }, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.status(200).json({ message: 'Room updated successfully.', room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update room', error: error.message });
  }
}

export async function deleteRoom(req, res) {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    await Booking.deleteMany({
      room_id: req.params.id,
      booking_status: 'pending'
    });
    res.status(200).json({ message: 'Room deleted. Pending bookings removed, history kept.' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
}

export async function searchAvailableRooms(req, res) {
  try {
    const { checkIn, checkOut, roomType } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkin and checkout dates are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const overlappingBookings = await Booking.find({
      $and: [
        { booking_status: { $nin: ["cancelled", "rejected"] } },
        {
          $or: [
            { check_in_date: { $lt: checkOutDate }, check_out_date: { $gt: checkInDate } }
          ]
        }
      ]
    });

    const bookedRoomIds = overlappingBookings.map(booking => booking.room_id);

    let roomQuery = {
      _id: { $nin: bookedRoomIds },
      availability_status: true,
    };

    if (roomType) {
      roomQuery.room_type = roomType;
    }

    const availableRooms = await Room.find(roomQuery);


    res.status(200).json({
      rooms: availableRooms
    });

  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({ message: 'Failed to search rooms', error: error.message });
  }
}

export async function updateAvailability(req, res) {
  try {
    const { availability_status } = req.body;

    if (typeof availability_status !== 'boolean') {
      return res.status(400).json({ message: "Availability status must be true or false." });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, {
      availability_status: availability_status
    },
      { new: true, runValidators: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    res.status(200).json({ message: 'Availability updated successfully.', room: updatedRoom });

  } catch (error) {
    console.error("Error updating room availability:", error);
    res.status(500).json({ message: 'Failed to update availability', error: error.message });
  }
}