import { GoogleGenerativeAI } from "@google/generative-ai";
import aiConfig from "../config/ai-config";

const API_KEY = process.env.GOOGLE_GENAI_API_KEY || '';
// Actualizado a un modelo compatible con la versión v1beta
const MODEL_NAME = "gemini-2.0-flash";

// Función para validar la API key
const validateApiKey = () => {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured');
  }
};

// Función para manejar errores
async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error('AI Operation Error:', error);
    throw error;
  }
}

export const ai = new GoogleGenerativeAI(API_KEY);

export const aiInstance = {
  async generateContent(prompt: string) {
    validateApiKey();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });

    try {
      // Para manejar tanto texto como imágenes en el prompt
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error al generar contenido:', error);
      throw error;
    }
  }
};

export default aiInstance;




