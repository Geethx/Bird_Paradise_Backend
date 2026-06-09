import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import guestRoutes from "./src/routes/guestRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import chatRoutes from "./src/routes/chat.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.log("Failed to connect to MongoDB!", err));

app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

export default app;
