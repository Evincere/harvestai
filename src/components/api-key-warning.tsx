'use client';

import { useEffect, useState } from 'react';

export function ApiKeyWarning() {
  // Estado para controlar si se debe mostrar la advertencia
  const [showWarning, setShowWarning] = useState(false);
  
  // Verificar la API key solo en el cliente
  useEffect(() => {
    // Verificamos si la API key está configurada
    // Nota: En el cliente no podemos acceder directamente a process.env.GOOGLE_GENAI_API_KEY
    // pero podemos verificar si el análisis funciona correctamente
    
    // Verificamos si hay un error en localStorage que indique problemas con la API key
    const hasApiKeyError = localStorage.getItem('api_key_error') === 'true';
    
    setShowWarning(hasApiKeyError);
  }, []);
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-md">
      <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Error de configuración</h3>
      <p className="text-sm text-red-700 dark:text-red-400 mb-2">
        La API de Google AI no está configurada. No se podrán realizar análisis de imágenes hasta que se configure correctamente.
      </p>
      <p className="text-sm text-red-700 dark:text-red-400">
        Para usar la aplicación, configura la variable de entorno <code className="bg-red-200 dark:bg-red-800 px-1 py-0.5 rounded">GOOGLE_GENAI_API_KEY</code> en el archivo <code className="bg-red-200 dark:bg-red-800 px-1 py-0.5 rounded">.env.local</code>.
      </p>
    </div>
  );
}
