import { GeoLocation, WeatherData } from '@/types/weather';

class WeatherApiService {
  async getCurrentWeather(
    location: GeoLocation,
    apiKey: string,
    baseUrl: string = 'https://api.weatherapi.com/v1'
  ): Promise<WeatherData> {
    try {
      // WeatherAPI permite obtener datos actuales y pronóstico en una sola llamada
      const url = `${baseUrl}/forecast.json?key=${apiKey}&q=${location.latitude},${location.longitude}&days=7&aqi=yes&alerts=no`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos de WeatherAPI: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar los datos al formato estándar
      return this.transformData(data, location);
    } catch (error) {
      console.error('Error en WeatherApiService:', error);
      throw error;
    }
  }

  private transformData(data: any, location: GeoLocation): WeatherData {
    // Transformar datos actuales
    const current = {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      uv_index: data.current.uv,
      wind_speed: data.current.wind_kph,
      precipitation: data.current.precip_mm,
      condition: data.current.condition.text,
      timestamp: data.current.last_updated_epoch ? 
        new Date(data.current.last_updated_epoch * 1000).toISOString() : 
        new Date().toISOString()
    };

    // Transformar pronóstico
    const forecast = data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      temperature_max: day.day.maxtemp_c,
      temperature_min: day.day.mintemp_c,
      humidity: day.day.avghumidity,
      uv_index: day.day.uv,
      precipitation_probability: day.day.daily_chance_of_rain,
      condition: day.day.condition.text
    }));

    return {
      location: {
        ...location,
        name: data.location.name,
        country: data.location.country,
        region: data.location.region
      },
      current,
      forecast,
      source: 'WeatherAPI'
    };
  }
}

export const weatherApiService = new WeatherApiService();
