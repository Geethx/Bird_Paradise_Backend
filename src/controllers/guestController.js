import Guest from "../models/guest.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function registerGuest(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newGuest = new Guest({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newGuest.save();

    res.status(201).json({ message: "Successfully registered!" });
  } catch (error) {
    console.error("Error registering guest:", error);
    res.status(500).json({
      message: "Something went wrong, please try again.",
      error: error.message,
    });
  }
}

export async function loginGuest(req, res) {
  try {
    const { email, password } = req.body;

    const guest = await Guest.findOne({ email });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    const isMatch = await bcrypt.compare(password, guest.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: guest._id, role: "guest" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      token: token,
      message: "Login successful!",
      guest: {
        id: guest._id,
        name: guest.name,
        email: guest.email,
      },
    });
  } catch (error) {
    console.error("Error logging in guest:", error);
    res.status(500).json({
      message: "Something went wrong, please try again.",
      error: error.message,
    });
  }
}

export async function getAllGuests(req, res) {
  try {
    const guests = await Guest.find().select('-password');
    res.status(200).json({ guests: guests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ message: 'Failed to fetch guests', error: error.message });
  }
}
