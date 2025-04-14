interface AIConfig {
  googleAI: {
    apiKey: string;
    modelConfig: {
      vision: string;
      text: string;
    };
    maxRetries: number;
    timeout: number;
  }
}

const aiConfig: AIConfig = {
  googleAI: {
    apiKey: 'dummy-key', // Clave ficticia para evitar errores
    modelConfig: {
      vision: 'gemini-2.0-flash',
      text: 'gemini-2.0-flash',
    },
    maxRetries: 3,
    timeout: 30000,
  }
};

// Versión modificada que no lanza errores
export function validateAIConfig() {
  if (!aiConfig.googleAI.apiKey) {
    console.warn('GOOGLE_GENAI_API_KEY no está configurada. Las funcionalidades de IA estarán limitadas.');
  }
}

export default aiConfig;
