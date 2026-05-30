import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

        res.status(200).json({ token: token , message: "Login successful.", admin: { id: admin._id, username: admin.username, role: admin.role } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in admin.", error: error.message });
    }
}