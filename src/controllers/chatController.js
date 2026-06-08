import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // බුද්ධිමත්ම සහ වේගවත්ම Model එක (gemini-1.5-flash) තෝරගන්නවා
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      // AI ට උපදෙස් (System Prompt) දෙන තැන
      systemInstruction: `You are Birdy, a friendly and professional receptionist at BirdParadise Hotel in Sri Lanka. 
      Hotel Details: 
      - Check-in time: 2:00 PM
      - Check-out time: 12:00 PM (Noon)
      - Minimum stay: 1 night
      - Room types: Single, Double, Suite
      Be very polite, short and concise in your answers. Do not make up prices if you don't know, tell them to search available rooms on the website.
      If they ask in Sinhala or Singlish, reply in Sinhala in a friendly manner.`
    });

    // Guest ගේ මැසේජ් එක AI ට යවලා උත්තරේ ගන්නවා
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    // උත්තරේ ආපහු Frontend එකට යවනවා
    res.status(200).json({ reply: responseText });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "Sorry, I am having trouble connecting to my brain right now.", error: error.message });
  }
}
