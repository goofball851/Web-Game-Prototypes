
import { GoogleGenAI } from "@google/genai";

export async function fetchMissionBriefing(): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Write a high-stakes, 3-sentence military briefing for 'Operation Silent Shadow'. The target is an obsidian data chip located in a heavily guarded facility in Zurich. Keep it dark and professional.",
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text || "Infiltration mission active. Retrieve the data core. Avoid detection at all costs.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The facility is locked down. Expect heavy resistance. Silence is your only ally.";
  }
}
