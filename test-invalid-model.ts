import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    await ai.models.generateContent({
      model: "gemini-9.9-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }]
    });
  } catch (e: any) {
    console.log("Error message:", e.message);
  }
}
test();
