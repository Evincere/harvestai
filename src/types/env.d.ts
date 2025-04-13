declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_GENAI_API_KEY: string;
      NEXT_PUBLIC_APP_DOMAIN?: string;
      NEXT_PUBLIC_APP_VERSION?: string;
      NEXT_PUBLIC_ENABLE_CLIENT_AI?: string;

      // APIs de clima
      OPENWEATHERMAP_API_KEY?: string;
      VISUALCROSSING_API_KEY?: string;
      WEATHERAPI_KEY?: string;
      AERISWEATHER_CLIENT_ID?: string;
      AERISWEATHER_CLIENT_SECRET?: string;

      // Configuración de geolocalización
      NEXT_PUBLIC_ENABLE_GEOLOCATION?: string;
    }
  }
}

export { };