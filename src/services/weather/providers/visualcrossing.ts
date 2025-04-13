import { GeoLocation, WeatherData } from '@/types/weather';

class VisualCrossingService {
  async getCurrentWeather(
    location: GeoLocation,
    apiKey: string,
    baseUrl: string = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'
  ): Promise<WeatherData> {
    try {
      // Visual Crossing permite obtener datos actuales y pronóstico en una sola llamada
      const url = `${baseUrl}/${location.latitude},${location.longitude}?unitGroup=metric&include=current,days&key=${apiKey}&contentType=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos de Visual Crossing: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar los datos al formato estándar
      return this.transformData(data, location);
    } catch (error) {
      console.error('Error en VisualCrossingService:', error);
      throw error;
    }
  }

  private transformData(data: any, location: GeoLocation): WeatherData {
    // Transformar datos actuales
    const current = {
      temperature: data.currentConditions.temp,
      humidity: data.currentConditions.humidity,
      uv_index: data.currentConditions.uvindex,
      wind_speed: data.currentConditions.windspeed, // Ya está en km/h
      precipitation: data.currentConditions.precip || 0,
      condition: data.currentConditions.conditions,
      timestamp: new Date(data.currentConditions.datetimeEpoch * 1000).toISOString()
    };

    // Transformar pronóstico
    const forecast = data.days.slice(0, 7).map((day: any) => ({
      date: day.datetime,
      temperature_max: day.tempmax,
      temperature_min: day.tempmin,
      humidity: day.humidity,
      uv_index: day.uvindex,
      precipitation_probability: day.precipprob,
      condition: day.conditions
    }));

    return {
      location: {
        ...location,
        name: data.resolvedAddress,
        country: data.resolvedAddress.split(',').pop()?.trim() || ''
      },
      current,
      forecast,
      source: 'Visual Crossing'
    };
  }
}

export const visualCrossingService = new VisualCrossingService();
