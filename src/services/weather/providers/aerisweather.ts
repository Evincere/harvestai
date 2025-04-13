import { GeoLocation, WeatherData } from '@/types/weather';

class AerisWeatherService {
  async getCurrentWeather(
    location: GeoLocation,
    clientId: string,
    clientSecret: string,
    baseUrl: string = 'https://api.aerisapi.com'
  ): Promise<WeatherData> {
    try {
      // Obtener datos actuales
      const currentUrl = `${baseUrl}/observations/${location.latitude},${location.longitude}?client_id=${clientId}&client_secret=${clientSecret}&format=json`;
      const currentResponse = await fetch(currentUrl);

      if (!currentResponse.ok) {
        throw new Error(`Error al obtener datos de Aeris Weather: ${currentResponse.statusText}`);
      }

      const currentData = await currentResponse.json();

      // Obtener pronóstico
      const forecastUrl = `${baseUrl}/forecasts/${location.latitude},${location.longitude}?client_id=${clientId}&client_secret=${clientSecret}&format=json&filter=day&limit=7`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error(`Error al obtener pronóstico de Aeris Weather: ${forecastResponse.statusText}`);
      }

      const forecastData = await forecastResponse.json();

      // Transformar los datos al formato estándar
      return this.transformData(currentData, forecastData, location);
    } catch (error) {
      console.error('Error en AerisWeatherService:', error);
      throw error;
    }
  }

  private transformData(currentData: any, forecastData: any, location: GeoLocation): WeatherData {
    // Verificar que los datos sean válidos
    if (!currentData.success || !forecastData.success) {
      console.error('Respuesta inválida de Aeris Weather:', { currentData, forecastData });
      throw new Error('No se pudieron obtener datos climáticos de Aeris Weather. Verifica tu conexión a internet o las credenciales de la API.');
    }

    const obsData = currentData.response;

    // Verificar que la estructura de datos sea la esperada
    if (!obsData || !obsData.ob) {
      console.error('Estructura de datos inesperada en Aeris Weather:', obsData);
      throw new Error('No se pudieron interpretar los datos climáticos de Aeris Weather. El formato de respuesta ha cambiado o la API está en mantenimiento.');
    }

    // Transformar datos actuales con validación
    const current = {
      temperature: obsData.ob.tempC !== undefined ? obsData.ob.tempC : 20, // Valor predeterminado si no existe
      humidity: obsData.ob.humidity !== undefined ? obsData.ob.humidity : 50,
      uv_index: obsData.ob.uvi !== undefined ? obsData.ob.uvi : 0,
      wind_speed: obsData.ob.windKPH !== undefined ? obsData.ob.windKPH : 0,
      precipitation: obsData.ob.precipMM !== undefined ? obsData.ob.precipMM : 0,
      condition: obsData.ob.weather || 'Unknown',
      timestamp: obsData.ob.timestamp ? new Date(obsData.ob.timestamp * 1000).toISOString() : new Date().toISOString()
    };

    // Transformar pronóstico con validación
    let forecast = [];
    try {
      if (forecastData.response && forecastData.response[0] && forecastData.response[0].periods) {
        forecast = forecastData.response[0].periods.map((period: any) => ({
          date: new Date(period.timestamp * 1000).toISOString().split('T')[0],
          temperature_max: period.maxTempC !== undefined ? period.maxTempC : 25,
          temperature_min: period.minTempC !== undefined ? period.minTempC : 15,
          humidity: period.humidity !== undefined ? period.humidity : 50,
          uv_index: period.uvi !== undefined ? period.uvi : 0,
          precipitation_probability: period.pop !== undefined ? period.pop : 0,
          condition: period.weather || 'Unknown'
        }));
      } else {
        console.warn('Datos de pronóstico incompletos en Aeris Weather');
      }
    } catch (error) {
      console.error('Error al procesar el pronóstico de Aeris Weather:', error);
      // Crear un pronóstico vacío para evitar errores
      forecast = [];
    }

    // Construir objeto de ubicación con validación
    const locationInfo = {
      ...location,
      name: obsData.place && obsData.place.name ? obsData.place.name : 'Unknown',
      country: obsData.place && obsData.place.country ? obsData.place.country : '',
      region: obsData.place && obsData.place.state ? obsData.place.state : ''
    };

    return {
      location: locationInfo,
      current,
      forecast,
      source: 'Aeris Weather'
    };
  }
}

export const aerisWeatherService = new AerisWeatherService();
