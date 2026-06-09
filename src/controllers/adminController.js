import Admin from '../models/admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/booking.js';
import Room from '../models/room.js';


export async function registerAdmin(req, res) {
    try {
        const { username, password } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });
        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error registering admin.", error: error.message });
    }
}

export async function loginAdmin(req, res) {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
        )

        res.status(200).json({ token: token, message: "Login successful.", admin: { id: admin._id, username: admin.username, role: admin.role } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in admin.", error: error.message });
    }
}

export async function generateReports(req, res) {
    try {
            const totalRooms = await Room.countDocuments();
            const totalCancellations = await Booking.countDocuments({ booking_status: 'cancelled' });

            const confirmedBookings = await Booking.find({ booking_status: 'confirmed'}).populate('room_id');

            let totalRevenue = 0;

            confirmedBookings.forEach(booking => {
                const checkIn = new Date(booking.check_in_date);
                const checkOut = new Date(booking.check_out_date);
                const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
                const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                if (booking.room_id && booking.room_id.price) {
                    totalRevenue += (booking.room_id.price * diffDays);
                }
            });

            res.status(200).json({
                message: "Reports Generated Successfully!",
                reports: {
                    totalRooms: totalRooms,
                    totalCancellations: totalCancellations,
                    totalRevenue: totalRevenue,
                    totalConfirmedBookings: confirmedBookings.length,
                }
            });
    } catch (error) {
            console.error("Error generating reports:", error);
            res.status(500).json({ message: "Error generating reports.", error: error.message });
    }
}