import { WeatherApiConfig } from '@/types/weather';

const weatherConfig: WeatherApiConfig = {
  openWeatherMap: {
    apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  },
  visualCrossing: {
    apiKey: process.env.VISUALCROSSING_API_KEY || '',
    baseUrl: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'
  },
  weatherApi: {
    apiKey: process.env.WEATHERAPI_KEY || '',
    baseUrl: 'https://api.weatherapi.com/v1'
  },
  aerisWeather: {
    clientId: process.env.AERISWEATHER_CLIENT_ID || '',
    clientSecret: process.env.AERISWEATHER_CLIENT_SECRET || '',
    baseUrl: 'https://api.aerisapi.com'
  }
};

export function validateWeatherConfig() {
  let hasValidProvider = false;
  
  if (weatherConfig.openWeatherMap?.apiKey) {
    hasValidProvider = true;
  }
  
  if (weatherConfig.visualCrossing?.apiKey) {
    hasValidProvider = true;
  }
  
  if (weatherConfig.weatherApi?.apiKey) {
    hasValidProvider = true;
  }
  
  if (weatherConfig.aerisWeather?.clientId && weatherConfig.aerisWeather?.clientSecret) {
    hasValidProvider = true;
  }
  
  if (!hasValidProvider) {
    console.warn(
      'No se ha configurado ninguna API de clima. Las funcionalidades de clima estarán limitadas.'
    );
  }
}

export default weatherConfig;
