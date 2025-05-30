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
    apiKey: process.env.GOOGLE_GENAI_API_KEY || '',
    modelConfig: {
      vision: 'gemini-2.0-flash',  // Actualizado para usar el modelo compatible con v1beta
      text: 'gemini-2.0-flash',
    },
    maxRetries: 3,
    timeout: 30000,
  }
};

export function validateAIConfig() {
  if (!aiConfig.googleAI.apiKey) {
    console.warn('GOOGLE_GENAI_API_KEY no está configurada. Las funcionalidades de IA estarán limitadas.');
    // No lanzamos error para permitir que la aplicación inicie
    return false;
  }
  return true;
}

export default aiConfig;