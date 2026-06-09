import { GoogleGenAI } from "@google/genai";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

export async function handleChat(req, res) {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const { message, language } = req.body;

        if (!message || !language) {
            return res.status(400).json({ message: "Message and language are required" });
        }

        const allRooms = await Room.find({});
        const allBookings = await Booking.find({ booking_status: "confirmed" });

        const roomsInfo = allRooms.map(r => `- Room ID: ${r._id}, Type: ${r.room_type}, Price: $${r.price}`).join("\n");

        const bookingsInfo = allBookings.map(b => {
            try {
                const start = b.check_in_date ? new Date(b.check_in_date).toISOString().split('T')[0] : "unknown";
                const end = b.check_out_date ? new Date(b.check_out_date).toISOString().split('T')[0] : "unknown";
                return `- Room ID: ${b.room_id} is booked from ${start} to ${end}`;
            } catch (e) {
                return `- Room ID: ${b.room_id} is booked`;
            }
        }).join("\n");

        const today = new Date().toISOString().split('T')[0];
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: message,
            config: {
                systemInstruction: `You are Birdy, a friendly and professional receptionist at BirdParadise Hotel in Sri Lanka. 
                Today's Date is: ${today}
                Hotel Details: Check-in time: 2:00 PM, Check-out time: 12:00 PM (Noon), Minimum stay: 1 night.
                HERE IS THE REAL-TIME DATABASE INFORMATION:
                Available Room Types and Prices:
                ${roomsInfo}
                Current Confirmed Bookings:
                ${bookingsInfo}
                Based on the above database information, answer the user's questions about room prices and availability. 
                
                IF USER ASKS ABOUT A SPECIFIC DATE OR RANGE:
                1. Check if the room is in the "Current Confirmed Bookings" list for that specific date range.
                2. If the room is NOT in the list for that date range, it is AVAILABLE.
                3. If the user asks "Is Room Type X available on [Date]?", check the bookings. If there are no bookings for Room Type X on that date, say: "Yes, Room Type [Room Type] is available on [Date]."  
    
                If the room is in the "Current Confirmed Bookings" list for the requested date, say: "No, Room Type [Room Type] is already booked on [Date]."
                Do not mention the Room IDs to the user, just mention the Room Types.
                Be very polite, short and concise in your answers. Do not make up prices.
                CRITICAL INSTRUCTION: You MUST reply ONLY in ${language} language. 
                No matter what, keep the conversation in ${language}.`
            }
        });

        res.status(200).json({ reply: response.text });

    } catch (error) {
        res.status(500).json({ message: "Sorry, I am having trouble connecting to my brain right now.", error: error.message });
    }
}
