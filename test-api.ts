import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }]
    });
  } catch (e: any) {
    console.log("Error type:", typeof e);
    console.log("Error message:", e.message);
    console.log("Error status:", e.status);
    console.log(e);
  }
}
test();
