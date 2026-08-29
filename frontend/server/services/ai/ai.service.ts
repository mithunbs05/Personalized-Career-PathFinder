import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export class AIService {
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    this.modelName = process.env.AI_MODEL || "gemini-2.5-flash";

    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateJSON<T>(prompt: string, fallbackData: T): Promise<T> {
    if (!this.client) {
      return fallbackData;
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text?.trim();
      if (!text) return fallbackData;

      return JSON.parse(text) as T;
    } catch (err) {
      console.warn("[AIService] Error generating JSON, using structured fallback:", err);
      return fallbackData;
    }
  }

  async generateText(prompt: string, fallbackText: string): Promise<string> {
    if (!this.client) {
      return fallbackText;
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt
      });

      return response.text?.trim() || fallbackText;
    } catch (err) {
      console.warn("[AIService] Error generating text, using structured fallback:", err);
      return fallbackText;
    }
  }
}

export const aiService = new AIService();
