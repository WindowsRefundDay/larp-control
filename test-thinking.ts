import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: "hi" }] }],
      config: {
        thinkingConfig: {
          thinkingLevel: "HIGH" as any
        }
      }
    });
    console.log(res.text);
  } catch (e: any) {
    console.log("Error message:", e.message);
  }
}
test();
