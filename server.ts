import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for audio files
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioData, mimeType } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: "No audio data provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "audio/webm",
                  data: audioData
                }
              },
              { text: "Transcribe the following audio precisely. Respond with only the transcription, no additional text or formatting." }
            ]
          }
        ]
      });

      const transcription = response.text || "";
      res.json({ transcription });
    } catch (error: any) {
      console.error("Transcription error:", error);
      
      // If it fails, try falling back to gemini-3.1-flash-lite
      if (error.message?.includes('model') || error.status === 404) {
        try {
           console.log("Falling back to gemini-3.1-flash-lite...");
           const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
           const response = await ai.models.generateContent({
             model: "gemini-3.1-flash-lite",
             contents: [
               {
                 role: "user",
                 parts: [
                   {
                     inlineData: {
                       mimeType: req.body.mimeType || "audio/webm",
                       data: req.body.audioData
                     }
                   },
                   { text: "Transcribe the following audio precisely. Respond with only the transcription, no additional text or formatting." }
                 ]
               }
             ]
           });
           return res.json({ transcription: response.text || "" });
         } catch (fallbackError: any) {
            console.error("Fallback error:", fallbackError);
            return res.status(500).json({ error: fallbackError.message });
         }
      }

      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "No message provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemPrompt = `You are an advanced autonomous AI coding assistant. The user wants you to simulate performing a multi-agent programming task, executing background sub-agents, running build tools, and changing code files.

To render this simulation as a gorgeous, high-fidelity, interactive dashboard, you MUST output custom XML-style tags directly within your markdown response instead of regular bullet lists when presenting workflows or files.

Here are the custom tag sets you must use:

1. To-dos lists (TodoList and TodoItem):
<TodoList title="To-dos X">
  <TodoItem status="done">Phase 1: Research - metis (plan validation), librarian...</TodoItem>
  <TodoItem status="active">Phase 2: hephaestus - Implement welcome AI prompt component</TodoItem>
  <TodoItem status="pending">Phase 3: generalPurpose - Wire App.tsx state coordination</TodoItem>
</TodoList>
Valid status values: "done", "active", "pending".

2. Active Sub-Agent Blocks (SubAgentBlocks and SubAgentBlock):
<SubAgentBlocks>
  <SubAgentBlock name="Metis" detail="Read src/App.css" duration="1500" />
  <SubAgentBlock name="Librarian" detail="Ran command \\"cd /workspace && grep -A 30 'FitViewOptions'\\"" duration="2000" />
</SubAgentBlocks>
Set "duration" in milliseconds (e.g., "1500" or "2000") to control how long the progress spinner stays active before turning into a green checkmark.

3. Compilation/Build Table (BuildTable and BuildRow):
<BuildTable>
  <BuildRow layer="Frontend (React + TS + Vite)" command="tsc -b && vite build" result="120 modules, 0 errors" />
</BuildTable>

4. Files Diff List (FilesList and FileDiff):
<FilesList title="13 Files">
  <FileDiff name="AppShell.tsx" additions="13" deletions="0" />
  <FileDiff name="tauri.ts" additions="170" deletions="0" />
  <FileDiff name="App.css" additions="18" deletions="370" />
</FilesList>

Guidelines:
- Start with a realistic description of your approach and plan.
- Use the custom tags to represent the tasks, active agents, files, or builds.
- Include thoughts or logs (e.g. "Thought for 15s" or bullet points) to explain key insights.
- ALWAYS conclude with a highly professional, realistic message explaining that the sub-agents have been dispatched and are executing in the background, so you do not have to remain waiting for them to complete. Do not say "it's a demo" or "That's it for the demo" — keep it completely immersive, clean, and authentic.
- Match the style, visual details, and professional tone shown in screenshots.

The user's instruction is: "${message}"`;

      const contents = [
        {
          role: "user",
          parts: [
            { text: systemPrompt }
          ]
        }
      ];

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: contents
        });
        res.json({ response: response.text || "Simulated action completed." });
      } catch (error: any) {
        console.error("Primary model error:", error.message);
        console.log("Falling back to gemini-3.1-flash-lite...");
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: contents
        });
        res.json({ response: fallbackResponse.text || "Simulated action completed via fallback." });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
