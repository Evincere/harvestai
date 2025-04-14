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

      // Obtener alertas meteorológicas (incluido granizo)
      let alertsData = null;
      try {
        // One Call API incluye alertas meteorológicas
        const oneCallUrl = `${baseUrl}/onecall?lat=${location.latitude}&lon=${location.longitude}&exclude=minutely,hourly&appid=${apiKey}&units=metric`;
        const alertsResponse = await fetch(oneCallUrl);

        if (alertsResponse.ok) {
          alertsData = await alertsResponse.json();
        }
      } catch (alertError) {
        console.warn('No se pudieron obtener alertas de OpenWeatherMap:', alertError);
        // Continuamos sin alertas si hay error
      }

      // Procesar y transformar los datos al formato estándar
      return this.transformData(currentData, forecastData, location, alertsData);
    } catch (error) {
      console.error('Error en OpenWeatherMapService:', error);
      throw error;
    }
  }

  private transformData(currentData: any, forecastData: any, location: GeoLocation, alertsData: any = null): WeatherData {
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

    // Procesar alertas si están disponibles
    const alerts = this.processAlerts(alertsData);

    // Verificar si hay alertas de granizo en el pronóstico
    const forecastWithHailProbability = this.checkForHailInForecast(dailyForecasts, forecastData);

    return {
      location: {
        ...location,
        name: currentData.name,
        country: currentData.sys.country
      },
      current,
      forecast: forecastWithHailProbability,
      alerts: alerts.length > 0 ? alerts : undefined,
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
  /**
   * Procesa las alertas meteorológicas de OpenWeatherMap
   */
  private processAlerts(alertsData: any): any[] {
    if (!alertsData || !alertsData.alerts || !Array.isArray(alertsData.alerts)) {
      return [];
    }

    return alertsData.alerts.map((alert: any) => {
      // Determinar el tipo de alerta
      const description = alert.description?.toLowerCase() || '';
      let type = alert.event || 'weather_alert';

      // Detectar si la alerta menciona granizo
      if (
        description.includes('granizo') ||
        description.includes('hail') ||
        alert.event?.toLowerCase().includes('hail')
      ) {
        type = 'hail';
      }

      // Determinar la severidad
      let severity: 'minor' | 'moderate' | 'severe' | 'extreme' = 'moderate';

      if (alert.severity) {
        switch (alert.severity) {
          case 'Extreme':
            severity = 'extreme';
            break;
          case 'Severe':
            severity = 'severe';
            break;
          case 'Moderate':
            severity = 'moderate';
            break;
          case 'Minor':
            severity = 'minor';
            break;
        }
      }

      return {
        type,
        severity,
        title: alert.event || 'Alerta meteorológica',
        description: alert.description || 'No hay descripción disponible',
        start: new Date(alert.start * 1000).toISOString(),
        end: new Date(alert.end * 1000).toISOString(),
        source: alert.sender_name || 'OpenWeatherMap'
      };
    });
  }

  /**
   * Analiza el pronóstico para detectar posibilidad de granizo
   */
  private checkForHailInForecast(dailyForecasts: any[], rawForecastData: any): any[] {
    if (!dailyForecasts || !Array.isArray(dailyForecasts)) {
      return [];
    }

    // Clonar el pronóstico para no modificar el original
    const forecastWithHail = JSON.parse(JSON.stringify(dailyForecasts));

    // Analizar cada elemento del pronóstico original para detectar granizo
    if (rawForecastData && rawForecastData.list && Array.isArray(rawForecastData.list)) {
      // Agrupar por día
      const dailyData: Record<string, any[]> = {};

      rawForecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];

        if (!dailyData[date]) {
          dailyData[date] = [];
        }

        dailyData[date].push(item);
      });

      // Verificar cada día para detectar condiciones que podrían indicar granizo
      Object.entries(dailyData).forEach(([date, items], index) => {
        if (index >= forecastWithHail.length) return;

        let hailProbability = 0;

        // Buscar códigos de condición que podrían indicar granizo
        const hasThunderstorm = items.some(item => {
          const weatherId = item.weather?.[0]?.id;
          // Códigos 200-202, 230-232: Tormentas con posibilidad de granizo
          return weatherId && ((weatherId >= 200 && weatherId <= 202) || (weatherId >= 230 && weatherId <= 232));
        });

        // Buscar explícitamente menciones de granizo
        const hasHailMention = items.some(item => {
          const description = item.weather?.[0]?.description?.toLowerCase() || '';
          return description.includes('granizo') || description.includes('hail');
        });

        // Verificar condiciones favorables para granizo
        const hasFavorableConditions = items.some(item => {
          // Temperatura baja con alta humedad y precipitación
          return (
            item.main?.temp < 15 &&
            item.main?.humidity > 70 &&
            (item.pop > 0.4 || (item.rain && item.rain['3h'] > 5))
          );
        });

        // Calcular probabilidad de granizo
        if (hasHailMention) {
          hailProbability = 90; // Mención explícita de granizo
        } else if (hasThunderstorm && hasFavorableConditions) {
          hailProbability = 70; // Tormenta con condiciones favorables
        } else if (hasThunderstorm) {
          hailProbability = 40; // Solo tormenta
        } else if (hasFavorableConditions) {
          hailProbability = 20; // Solo condiciones favorables
        }

        // Asignar probabilidad de granizo al pronóstico
        if (hailProbability > 0) {
          forecastWithHail[index].hail_probability = hailProbability;
        }
      });
    }

    return forecastWithHail;
  }
}

export const openWeatherMapService = new OpenWeatherMapService();
