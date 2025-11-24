import { GoogleGenAI } from "@google/genai";
import { TranslationMode } from "../types";

const getModelName = (mode: TranslationMode): string => {
  switch (mode) {
    case TranslationMode.PRECISE:
      return 'gemini-3-pro-preview';
    case TranslationMode.FAST:
    default:
      return 'gemini-2.5-flash';
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  mode: TranslationMode
): Promise<string> => {
  if (!text || !text.trim()) return "";
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = getModelName(mode);
  
  const prompt = `Translate the following text into ${targetLanguage}. 
  Do not include any explanations, introductory text, or markdown code blocks. 
  Only provide the direct translation.
  
  Text to translate:
  "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    
    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return "Error: Could not translate text. Please try again.";
  }
};
