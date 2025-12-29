
import { GoogleGenAI, Type } from "@google/genai";
import { RunFlavor, VisualStyle } from "../types";

// Initialize the Gemini AI client using the API key exclusively from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRunFlavor = async (): Promise<RunFlavor> => {
  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-flash-preview for creative text generation tasks.
      model: "gemini-3-flash-preview",
      contents: "Generate a wacky experimental setup for a high-speed security AI training run.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characterName: { type: Type.STRING },
            weaponName: { type: Type.STRING },
            destructionStyle: { type: Type.STRING },
            initialStyle: { 
                type: Type.STRING, 
                enum: Object.values(VisualStyle) 
            },
            labCommentary: { type: Type.STRING }
          },
          required: ["characterName", "weaponName", "destructionStyle", "initialStyle", "labCommentary"]
        }
      }
    });

    // Access the generated text content directly via the .text property.
    const data = JSON.parse(response.text);
    return data as RunFlavor;
  } catch (error) {
    console.error("Gemini failed, using fallback flavor:", error);
    return {
      characterName: "Test Subject #404",
      weaponName: "Standard Plasma Sizzler",
      destructionStyle: "Vaporization",
      initialStyle: VisualStyle.NEON,
      labCommentary: "Keep moving. Or don't. Science doesn't care."
    };
  }
};
