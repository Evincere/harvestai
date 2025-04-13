import { GeoLocation, WeatherData } from '@/types/weather';

class OpenWeatherMapService {
  async getCurrentWeather(
    location: GeoLocation,
    apiKey: string,
    baseUrl: string = 'https://api.openweathermap.org/data/2.5'
  ): Promise<WeatherData> {
    try {
      // Obtener datos actuales
      const currentUrl = `${baseUrl}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
      const currentResponse = await fetch(currentUrl);
      
      if (!currentResponse.ok) {
        throw new Error(`Error al obtener datos de OpenWeatherMap: ${currentResponse.statusText}`);
      }
      
      const currentData = await currentResponse.json();
      
      // Obtener pronóstico de 5 días
      const forecastUrl = `${baseUrl}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Error al obtener pronóstico de OpenWeatherMap: ${forecastResponse.statusText}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Procesar y transformar los datos al formato estándar
      return this.transformData(currentData, forecastData, location);
    } catch (error) {
      console.error('Error en OpenWeatherMapService:', error);
      throw error;
    }
  }

  private transformData(currentData: any, forecastData: any, location: GeoLocation): WeatherData {
    // Transformar datos actuales
    const current = {
      temperature: currentData.main.temp,
      humidity: currentData.main.humidity,
      uv_index: currentData.uvi || 0, // OpenWeatherMap puede no incluir UV en todos los planes
      wind_speed: currentData.wind.speed * 3.6, // Convertir m/s a km/h
      precipitation: currentData.rain ? (currentData.rain['1h'] || 0) : 0,
      condition: currentData.weather[0].description,
      timestamp: new Date(currentData.dt * 1000).toISOString()
    };

    // Transformar pronóstico
    // OpenWeatherMap devuelve pronósticos cada 3 horas, los agrupamos por día
    const dailyForecasts = this.processForecastData(forecastData);

    return {
      location: {
        ...location,
        name: currentData.name,
        country: currentData.sys.country
      },
      current,
      forecast: dailyForecasts,
      source: 'OpenWeatherMap'
    };
  }

  private processForecastData(forecastData: any) {
    // Agrupar pronósticos por día
    const dailyData: Record<string, any[]> = {};
    
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      
      dailyData[date].push(item);
    });
    
    // Procesar cada día para obtener máximos, mínimos y promedios
    return Object.entries(dailyData).map(([date, items]) => {
      const temperatures = items.map(item => item.main.temp);
      const humidities = items.map(item => item.main.humidity);
      
      // Calcular máximos y mínimos
      const temperature_max = Math.max(...temperatures);
      const temperature_min = Math.min(...temperatures);
      const humidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
      
      // Determinar la condición más común del día
      const conditions = items.map(item => item.weather[0].description);
      const conditionCounts: Record<string, number> = {};
      
      conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
      
      let mostCommonCondition = '';
      let maxCount = 0;
      
      Object.entries(conditionCounts).forEach(([condition, count]) => {
        if (count > maxCount) {
          mostCommonCondition = condition;
          maxCount = count;
        }
      });
      
      // Calcular probabilidad de precipitación
      const precipitation_probability = items.some(item => 
        (item.pop || 0) > 0.3 || (item.rain && item.rain['3h'])
      ) ? 
        Math.max(...items.map(item => (item.pop || 0) * 100)) : 0;
      
      return {
        date,
        temperature_max,
        temperature_min,
        humidity,
        uv_index: 0, // OpenWeatherMap no proporciona UV en el pronóstico básico
        precipitation_probability,
        condition: mostCommonCondition
      };
    });
  }
}

export const openWeatherMapService = new OpenWeatherMapService();
