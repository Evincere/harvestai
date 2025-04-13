import { GeoLocation, WeatherApiConfig, WeatherData } from '@/types/weather';
import { openWeatherMapService } from './providers/openweathermap';
import { visualCrossingService } from './providers/visualcrossing';
import { weatherApiService } from './providers/weatherapi';
import { aerisWeatherService } from './providers/aerisweather';

// Clase principal para gestionar los servicios de clima
export class WeatherService {
  private config: WeatherApiConfig;
  private availableProviders: string[] = [];

  constructor(config: WeatherApiConfig) {
    this.config = config;

    // Determinar qué proveedores están disponibles basados en la configuración
    if (config.openWeatherMap?.apiKey) this.availableProviders.push('openWeatherMap');
    if (config.visualCrossing?.apiKey) this.availableProviders.push('visualCrossing');
    if (config.weatherApi?.apiKey) this.availableProviders.push('weatherApi');
    if (config.aerisWeather?.clientId && config.aerisWeather?.clientSecret) {
      this.availableProviders.push('aerisWeather');
    }

    if (this.availableProviders.length === 0) {
      console.warn('No se ha configurado ningún proveedor de clima. Las funcionalidades de clima estarán limitadas.');
    }
  }

  // Obtener datos climáticos actuales de todos los proveedores disponibles
  async getAllWeatherData(location: GeoLocation): Promise<WeatherData[]> {
    const promises: Promise<WeatherData | null>[] = [];

    if (this.availableProviders.includes('openWeatherMap')) {
      promises.push(this.getOpenWeatherMapData(location));
    }

    if (this.availableProviders.includes('visualCrossing')) {
      promises.push(this.getVisualCrossingData(location));
    }

    if (this.availableProviders.includes('weatherApi')) {
      promises.push(this.getWeatherApiData(location));
    }

    if (this.availableProviders.includes('aerisWeather')) {
      promises.push(this.getAerisWeatherData(location));
    }

    // Esperar a que todas las promesas se resuelvan y filtrar los resultados nulos
    const results = await Promise.all(promises);
    return results.filter((data): data is WeatherData => data !== null);
  }

  // Obtener el mejor conjunto de datos climáticos (combinando múltiples fuentes si es posible)
  async getBestWeatherData(location: GeoLocation): Promise<WeatherData | null> {
    try {
      const allData = await this.getAllWeatherData(location);

      if (allData.length === 0) {
        console.warn('No se pudieron obtener datos climáticos de ningún proveedor.');
        return null;
      }

      if (allData.length === 1) {
        return allData[0];
      }

      // Si hay múltiples fuentes, combinar los datos para obtener la mejor estimación
      return this.combineWeatherData(allData, location);
    } catch (error) {
      console.error('Error al obtener datos climáticos:', error);
      return null;
    }
  }

  // Métodos privados para obtener datos de cada proveedor
  private async getOpenWeatherMapData(location: GeoLocation): Promise<WeatherData | null> {
    if (!this.config.openWeatherMap?.apiKey) return null;

    try {
      return await openWeatherMapService.getCurrentWeather(
        location,
        this.config.openWeatherMap.apiKey,
        this.config.openWeatherMap.baseUrl
      );
    } catch (error) {
      console.error('Error al obtener datos de OpenWeatherMap:', error);
      return null;
    }
  }

  private async getVisualCrossingData(location: GeoLocation): Promise<WeatherData | null> {
    if (!this.config.visualCrossing?.apiKey) return null;

    try {
      return await visualCrossingService.getCurrentWeather(
        location,
        this.config.visualCrossing.apiKey,
        this.config.visualCrossing.baseUrl
      );
    } catch (error) {
      console.error('Error al obtener datos de Visual Crossing:', error);
      return null;
    }
  }

  private async getWeatherApiData(location: GeoLocation): Promise<WeatherData | null> {
    if (!this.config.weatherApi?.apiKey) return null;

    try {
      return await weatherApiService.getCurrentWeather(
        location,
        this.config.weatherApi.apiKey,
        this.config.weatherApi.baseUrl
      );
    } catch (error) {
      console.error('Error al obtener datos de WeatherAPI:', error);
      return null;
    }
  }

  private async getAerisWeatherData(location: GeoLocation): Promise<WeatherData | null> {
    if (!this.config.aerisWeather?.clientId || !this.config.aerisWeather?.clientSecret) return null;

    try {
      return await aerisWeatherService.getCurrentWeather(
        location,
        this.config.aerisWeather.clientId,
        this.config.aerisWeather.clientSecret,
        this.config.aerisWeather.baseUrl
      );
    } catch (error) {
      console.error('Error al obtener datos de Aeris Weather:', error);
      return null;
    }
  }

  // Combinar datos de múltiples fuentes para obtener la mejor estimación
  private combineWeatherData(dataArray: WeatherData[], location: GeoLocation): WeatherData {
    // Inicializar valores para promediar
    let tempSum = 0;
    let humiditySum = 0;
    let uvSum = 0;
    let windSum = 0;
    let precipSum = 0;
    let validDataPoints = 0;

    // Condición más común
    const conditions: string[] = [];

    // Acumular valores
    dataArray.forEach(data => {
      if (data.current) {
        tempSum += data.current.temperature;
        humiditySum += data.current.humidity;
        uvSum += data.current.uv_index;
        windSum += data.current.wind_speed;
        precipSum += data.current.precipitation;
        conditions.push(data.current.condition);
        validDataPoints++;
      }
    });

    // Calcular promedios
    const avgTemp = validDataPoints > 0 ? tempSum / validDataPoints : 0;
    const avgHumidity = validDataPoints > 0 ? humiditySum / validDataPoints : 0;
    const avgUv = validDataPoints > 0 ? uvSum / validDataPoints : 0;
    const avgWind = validDataPoints > 0 ? windSum / validDataPoints : 0;
    const avgPrecip = validDataPoints > 0 ? precipSum / validDataPoints : 0;

    // Encontrar la condición más común
    const conditionCounts = conditions.reduce((acc, condition) => {
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let mostCommonCondition = '';
    let maxCount = 0;

    Object.entries(conditionCounts).forEach(([condition, count]) => {
      if (count > maxCount) {
        mostCommonCondition = condition;
        maxCount = count;
      }
    });

    // Combinar pronósticos si están disponibles
    const combinedForecasts = this.combineForecasts(dataArray);

    // Crear objeto de datos combinados
    return {
      location,
      current: {
        temperature: parseFloat(avgTemp.toFixed(1)),
        humidity: parseFloat(avgHumidity.toFixed(1)),
        uv_index: parseFloat(avgUv.toFixed(1)),
        wind_speed: parseFloat(avgWind.toFixed(1)),
        precipitation: parseFloat(avgPrecip.toFixed(1)),
        condition: mostCommonCondition,
        timestamp: new Date().toISOString()
      },
      forecast: combinedForecasts,
      source: 'combined'
    };
  }

  // Combinar pronósticos de múltiples fuentes
  private combineForecasts(dataArray: WeatherData[]) {
    // Obtener todos los pronósticos disponibles
    const allForecasts = dataArray
      .filter(data => data.forecast && data.forecast.length > 0)
      .map(data => data.forecast);

    if (allForecasts.length === 0) return undefined;

    // Usar el pronóstico más completo como base
    const mostCompleteIndex = allForecasts
      .map((forecast, index) => ({ length: forecast!.length, index }))
      .sort((a, b) => b.length - a.length)[0].index;

    return allForecasts[mostCompleteIndex];
  }
}
