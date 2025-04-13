import { CannabisVariety } from '@/types/cannabis';
import {
  ImpactLevel,
  OPTIMAL_CANNABIS_CONDITIONS,
  WeatherData,
  WeatherImpact
} from '@/types/weather';

export class WeatherImpactService {
  /**
   * Analiza el impacto de las condiciones climáticas actuales y pronosticadas en el cultivo de cannabis
   * @param weatherData Datos climáticos
   * @param variety Variedad de cannabis
   * @param ripenessLevel Nivel de madurez actual ('Temprano', 'Medio', 'Tardío')
   * @returns Análisis del impacto climático
   */
  analyzeWeatherImpact(
    weatherData: WeatherData,
    variety: CannabisVariety,
    ripenessLevel: 'Temprano' | 'Medio' | 'Tardío'
  ): WeatherImpact {
    // Determinar la etapa de floración basada en el nivel de madurez
    const floweringStage = this.getFloweringStage(ripenessLevel);

    // Analizar el impacto de la temperatura
    const temperatureImpact = this.analyzeTemperatureImpact(
      weatherData.current.temperature,
      floweringStage,
      variety.type
    );

    // Analizar el impacto de la humedad
    const humidityImpact = this.analyzeHumidityImpact(
      weatherData.current.humidity,
      floweringStage,
      variety.type
    );

    // Analizar el impacto de la radiación UV
    const uvImpact = this.analyzeUVImpact(
      weatherData.current.uv_index,
      floweringStage
    );

    // Determinar el impacto general
    const overallImpact = this.determineOverallImpact(
      temperatureImpact,
      humidityImpact,
      uvImpact
    );

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(
      temperatureImpact,
      humidityImpact,
      uvImpact,
      weatherData,
      variety,
      ripenessLevel
    );

    // Calcular ajuste de días hasta la cosecha
    const harvestAdjustment = this.calculateHarvestAdjustment(
      overallImpact,
      weatherData,
      ripenessLevel
    );

    return {
      temperature_impact: temperatureImpact,
      humidity_impact: humidityImpact,
      uv_impact: uvImpact,
      overall_impact: overallImpact,
      recommendations,
      harvest_adjustment_days: harvestAdjustment
    };
  }

  /**
   * Determina la etapa de floración basada en el nivel de madurez
   */
  private getFloweringStage(ripenessLevel: 'Temprano' | 'Medio' | 'Tardío'): 'EARLY_FLOWERING' | 'MID_FLOWERING' | 'LATE_FLOWERING' {
    switch (ripenessLevel) {
      case 'Temprano':
        return 'EARLY_FLOWERING';
      case 'Medio':
        return 'MID_FLOWERING';
      case 'Tardío':
        return 'LATE_FLOWERING';
      default:
        return 'MID_FLOWERING';
    }
  }

  /**
   * Analiza el impacto de la temperatura actual
   */
  private analyzeTemperatureImpact(
    temperature: number,
    floweringStage: 'EARLY_FLOWERING' | 'MID_FLOWERING' | 'LATE_FLOWERING',
    varietyType: string
  ): ImpactLevel {
    const optimalConditions = OPTIMAL_CANNABIS_CONDITIONS[floweringStage];

    // Ajustar rangos óptimos según el tipo de variedad
    let minTemp = optimalConditions.temperature_min;
    let maxTemp = optimalConditions.temperature_max;

    // Las Sativas toleran temperaturas más altas
    if (varietyType === 'Sativa') {
      minTemp += 1;
      maxTemp += 2;
    }

    // Las Indicas toleran temperaturas más bajas
    if (varietyType === 'Indica') {
      minTemp -= 1;
      maxTemp -= 1;
    }

    // Ajustes más precisos según la etapa de floración
    if (floweringStage === 'LATE_FLOWERING') {
      // En floración tardía, las temperaturas más bajas pueden mejorar la producción de resina
      minTemp -= 1;
      maxTemp -= 2;
    }

    // Determinar el impacto con umbrales más refinados
    if (temperature < minTemp - 6 || temperature > maxTemp + 6) {
      return ImpactLevel.CRITICAL;
    } else if (temperature < minTemp - 3 || temperature > maxTemp + 4) {
      return ImpactLevel.NEGATIVE;
    } else if (temperature < minTemp - 1 || temperature > maxTemp + 2) {
      return ImpactLevel.NEUTRAL;
    } else {
      return ImpactLevel.POSITIVE;
    }
  }

  /**
   * Analiza el impacto de la humedad actual
   */
  private analyzeHumidityImpact(
    humidity: number,
    floweringStage: 'EARLY_FLOWERING' | 'MID_FLOWERING' | 'LATE_FLOWERING',
    varietyType: string
  ): ImpactLevel {
    const optimalConditions = OPTIMAL_CANNABIS_CONDITIONS[floweringStage];

    // Ajustar rangos óptimos según el tipo de variedad y etapa
    let minHumidity = optimalConditions.humidity_min;
    let maxHumidity = optimalConditions.humidity_max;

    // Ajustes según el tipo de variedad
    if (varietyType === 'Sativa') {
      // Las Sativas suelen tolerar mejor la humedad alta
      minHumidity += 2;
      maxHumidity += 3;
    }

    // Las Indicas son más susceptibles a moho, especialmente en floración tardía
    if (varietyType === 'Indica') {
      maxHumidity -= 3;

      if (floweringStage === 'LATE_FLOWERING') {
        // Reducir aún más en floración tardía para prevenir moho
        maxHumidity -= 5;
      }
    }

    // Ajustes según la etapa de floración
    if (floweringStage === 'LATE_FLOWERING') {
      // En floración tardía, la humedad baja ayuda a prevenir moho y mejora la calidad
      minHumidity -= 2;
      maxHumidity -= 3;
    }

    // Determinar el impacto con umbrales más precisos
    if (humidity < minHumidity - 15 || humidity > maxHumidity + 15) {
      return ImpactLevel.CRITICAL;
    } else if (humidity < minHumidity - 8 || humidity > maxHumidity + 10) {
      return ImpactLevel.NEGATIVE;
    } else if (humidity < minHumidity - 3 || humidity > maxHumidity + 5) {
      return ImpactLevel.NEUTRAL;
    } else {
      return ImpactLevel.POSITIVE;
    }
  }

  /**
   * Analiza el impacto del índice UV actual
   */
  private analyzeUVImpact(
    uvIndex: number,
    floweringStage: 'EARLY_FLOWERING' | 'MID_FLOWERING' | 'LATE_FLOWERING'
  ): ImpactLevel {
    const optimalConditions = OPTIMAL_CANNABIS_CONDITIONS[floweringStage];

    // Ajustes según la etapa de floración
    let minUV = optimalConditions.uv_index_min;
    let maxUV = optimalConditions.uv_index_max;

    // En floración tardía, un poco más de UV puede mejorar la producción de cannabinoides
    if (floweringStage === 'LATE_FLOWERING') {
      maxUV += 1;
    }

    // Determinar el impacto con umbrales más precisos
    if (uvIndex < minUV - 3 || uvIndex > maxUV + 4) {
      return ImpactLevel.CRITICAL;
    } else if (uvIndex < minUV - 2 || uvIndex > maxUV + 3) {
      return ImpactLevel.NEGATIVE;
    } else if (uvIndex < minUV - 1 || uvIndex > maxUV + 1) {
      return ImpactLevel.NEUTRAL;
    } else {
      return ImpactLevel.POSITIVE;
    }
  }

  /**
   * Determina el impacto general basado en los impactos individuales
   */
  private determineOverallImpact(
    temperatureImpact: ImpactLevel,
    humidityImpact: ImpactLevel,
    uvImpact: ImpactLevel
  ): ImpactLevel {
    // Contar el número de cada tipo de impacto
    const impactCounts = {
      [ImpactLevel.CRITICAL]: 0,
      [ImpactLevel.NEGATIVE]: 0,
      [ImpactLevel.NEUTRAL]: 0,
      [ImpactLevel.POSITIVE]: 0
    };

    [temperatureImpact, humidityImpact, uvImpact].forEach(impact => {
      impactCounts[impact]++;
    });

    // Determinar el impacto general
    if (impactCounts[ImpactLevel.CRITICAL] > 0) {
      return ImpactLevel.CRITICAL;
    } else if (impactCounts[ImpactLevel.NEGATIVE] >= 2) {
      return ImpactLevel.NEGATIVE;
    } else if (impactCounts[ImpactLevel.NEGATIVE] === 1 || impactCounts[ImpactLevel.NEUTRAL] >= 2) {
      return ImpactLevel.NEUTRAL;
    } else {
      return ImpactLevel.POSITIVE;
    }
  }

  /**
   * Genera recomendaciones basadas en los impactos climáticos
   */
  private generateRecommendations(
    temperatureImpact: ImpactLevel,
    humidityImpact: ImpactLevel,
    uvImpact: ImpactLevel,
    weatherData: WeatherData,
    variety: CannabisVariety,
    ripenessLevel: 'Temprano' | 'Medio' | 'Tardío'
  ): string[] {
    const recommendations: string[] = [];
    const floweringStage = this.getFloweringStage(ripenessLevel);
    const optimalConditions = OPTIMAL_CANNABIS_CONDITIONS[floweringStage];

    // Recomendaciones basadas en la temperatura
    if (temperatureImpact === ImpactLevel.CRITICAL || temperatureImpact === ImpactLevel.NEGATIVE) {
      const temp = weatherData.current.temperature;

      if (temp < optimalConditions.temperature_min) {
        if (ripenessLevel === 'Tardío') {
          recommendations.push(
            `La temperatura actual de ${temp}°C es demasiado baja para tu ${variety.name} en etapa tardía de floración. Esto puede ralentizar la maduración final y aumentar el riesgo de moho. Considera cosechar antes si la planta está cerca de su punto óptimo, o proporciona calefacción suplementaria para mantener temperaturas entre ${optimalConditions.temperature_min}°C y ${optimalConditions.temperature_max}°C.`
          );
        } else {
          recommendations.push(
            `La temperatura actual de ${temp}°C está por debajo del rango óptimo para tu ${variety.name} en esta etapa de floración. Esto puede ralentizar el desarrollo y reducir la producción de resina. Considera mover la planta a un ambiente más cálido o usar calefacción suplementaria para mantener temperaturas entre ${optimalConditions.temperature_min}°C y ${optimalConditions.temperature_max}°C.`
          );
        }
      } else if (temp > optimalConditions.temperature_max) {
        if (ripenessLevel === 'Tardío') {
          recommendations.push(
            `La temperatura actual de ${temp}°C es demasiado alta para tu ${variety.name} en etapa tardía de floración. Esto puede acelerar la degradación de cannabinoides y aumentar el riesgo de plagas. Considera cosechar pronto si la planta está cerca de su punto óptimo, o mejora la ventilación y proporciona sombra para reducir la temperatura a un rango entre ${optimalConditions.temperature_min}°C y ${optimalConditions.temperature_max}°C.`
          );
        } else {
          recommendations.push(
            `La temperatura actual de ${temp}°C excede el rango óptimo para tu ${variety.name} en esta etapa de floración. Esto puede estresar la planta y afectar negativamente el desarrollo de los cogollos. Mejora la ventilación, proporciona sombra o considera sistemas de enfriamiento para mantener temperaturas entre ${optimalConditions.temperature_min}°C y ${optimalConditions.temperature_max}°C.`
          );
        }
      }
    }

    // Recomendaciones basadas en la humedad
    if (humidityImpact === ImpactLevel.CRITICAL || humidityImpact === ImpactLevel.NEGATIVE) {
      const humidity = weatherData.current.humidity;

      if (humidity < optimalConditions.humidity_min) {
        if (ripenessLevel === 'Temprano') {
          recommendations.push(
            `La humedad actual del ${humidity}% está por debajo del rango óptimo para tu ${variety.name} en etapa temprana de floración. La baja humedad puede ralentizar el crecimiento y desarrollo de los cogollos. Considera usar un humidificador o técnicas como bandejas de agua cerca de las plantas para aumentar la humedad a un rango entre ${optimalConditions.humidity_min}% y ${optimalConditions.humidity_max}%.`
          );
        } else {
          recommendations.push(
            `La humedad actual del ${humidity}% está por debajo del rango óptimo para tu ${variety.name} en esta etapa de floración. Aunque en floración tardía se prefiere humedad más baja, niveles extremadamente bajos pueden estresar la planta y afectar la calidad final. Considera aumentar ligeramente la humedad a un rango entre ${optimalConditions.humidity_min}% y ${optimalConditions.humidity_max}%.`
          );
        }
      } else if (humidity > optimalConditions.humidity_max) {
        if (ripenessLevel === 'Tardío') {
          recommendations.push(
            `¡Alerta! La humedad actual del ${humidity}% es significativamente alta para tu ${variety.name} en etapa tardía de floración. Esto aumenta considerablemente el riesgo de moho y podredumbre de cogollos. Mejora inmediatamente la ventilación, usa un deshumidificador, o considera cosechar pronto si la planta está cerca de su punto óptimo. La humedad ideal en esta etapa debería estar entre ${optimalConditions.humidity_min}% y ${optimalConditions.humidity_max}%.`
          );
        } else if (ripenessLevel === 'Medio') {
          recommendations.push(
            `La humedad actual del ${humidity}% es demasiado alta para tu ${variety.name} en etapa media de floración. Esto puede aumentar el riesgo de problemas fúngicos y afectar el desarrollo de los cogollos. Mejora la circulación de aire y considera usar un deshumidificador para reducir la humedad a un rango entre ${optimalConditions.humidity_min}% y ${optimalConditions.humidity_max}%.`
          );
        } else {
          recommendations.push(
            `La humedad actual del ${humidity}% está por encima del rango óptimo para tu ${variety.name} en esta etapa de floración. Aunque en etapa temprana se tolera mayor humedad, niveles excesivos pueden causar problemas. Mejora la ventilación para reducir la humedad a un rango entre ${optimalConditions.humidity_min}% y ${optimalConditions.humidity_max}%.`
          );
        }
      }
    }

    // Recomendaciones basadas en el pronóstico
    if (weatherData.forecast && weatherData.forecast.length > 0) {
      const nextDaysForecast = weatherData.forecast.slice(0, 5);

      // Verificar si hay cambios significativos en la temperatura
      const tempChanges = nextDaysForecast.some(day =>
        Math.abs(day.temperature_max - weatherData.current.temperature) > 5
      );

      if (tempChanges) {
        recommendations.push(
          'Se prevén cambios significativos de temperatura en los próximos días. Prepárate para ajustar las condiciones de cultivo.'
        );
      }

      // Verificar si hay alta probabilidad de precipitación (para cultivos exteriores)
      const highRainProbability = nextDaysForecast.some(day =>
        day.precipitation_probability > 70
      );

      if (highRainProbability) {
        if (ripenessLevel === 'Tardío') {
          recommendations.push(
            'ALERTA: Se prevén lluvias en los próximos días. Considera cosechar antes si la planta está en etapa tardía para evitar problemas de moho.'
          );
        } else {
          recommendations.push(
            'Se prevén lluvias en los próximos días. Asegúrate de tener protección adecuada para tus plantas si están en exterior.'
          );
        }
      }

      // Verificar si hay días consecutivos de alta humedad
      const highHumidityDays = nextDaysForecast.filter(day => day.humidity > 70).length;

      if (highHumidityDays >= 3 && ripenessLevel !== 'Temprano') {
        recommendations.push(
          'ALERTA: Se prevén varios días consecutivos de alta humedad. Esto aumenta significativamente el riesgo de moho, especialmente en etapas avanzadas de floración.'
        );
      }

      // Verificar si hay días consecutivos de temperaturas extremas
      const highTempDays = nextDaysForecast.filter(day => day.temperature_max > 30).length;
      const lowTempDays = nextDaysForecast.filter(day => day.temperature_min < 15).length;

      if (highTempDays >= 2) {
        recommendations.push(
          'Se prevén varios días de temperaturas elevadas. Asegúrate de tener suficiente ventilación y considera técnicas de enfriamiento.'
        );
      }

      if (lowTempDays >= 2) {
        recommendations.push(
          'Se prevén varios días de temperaturas bajas. Considera métodos para mantener el calor durante la noche.'
        );
      }
    }

    // Recomendaciones específicas según el nivel de madurez
    if (ripenessLevel === 'Temprano') {
      // Recomendaciones para etapa temprana de floración
      if (temperatureImpact === ImpactLevel.POSITIVE && humidityImpact === ImpactLevel.POSITIVE) {
        recommendations.push(
          `Las condiciones actuales son ideales para el desarrollo temprano de flores en tu ${variety.name}. Mantén estos niveles para maximizar el crecimiento y desarrollo de cogollos. En esta etapa, la planta está estableciendo la estructura básica de sus flores.`
        );
      }

      if (uvImpact === ImpactLevel.NEGATIVE || uvImpact === ImpactLevel.CRITICAL) {
        recommendations.push(
          `Para tu ${variety.name} en etapa temprana de floración, es importante un balance de luz: necesita suficiente intensidad para estimular el desarrollo de flores, pero un exceso de radiación UV directa puede estresar la planta. Considera proporcionar algo de sombra parcial durante las horas de mayor intensidad solar si está en exterior.`
        );
      }
    } else if (ripenessLevel === 'Medio') {
      // Recomendaciones para etapa media de floración
      if (temperatureImpact !== ImpactLevel.POSITIVE || humidityImpact !== ImpactLevel.POSITIVE) {
        recommendations.push(
          `Tu ${variety.name} está en la etapa crítica de floración media, donde es fundamental mantener condiciones estables. Evita fluctuaciones bruscas de temperatura y humedad, ya que pueden estresar la planta y afectar el desarrollo de los cogollos. Esta es la fase donde se establece gran parte del potencial de rendimiento y potencia.`
        );
      } else {
        recommendations.push(
          `Tu ${variety.name} está en la etapa media de floración con condiciones ambientales favorables. Esta es una fase crítica donde los cogollos desarrollan tamaño y densidad. Mantén estas condiciones estables y considera aumentar ligeramente los nutrientes específicos para floración si es necesario.`
        );
      }
    } else if (ripenessLevel === 'Tardío') {
      // Recomendaciones para etapa tardía de floración
      if (humidityImpact === ImpactLevel.NEGATIVE || humidityImpact === ImpactLevel.CRITICAL) {
        recommendations.push(
          `¡Atención! Tu ${variety.name} está en etapa tardía de floración donde la alta humedad representa un riesgo significativo de moho y podredumbre de cogollos. Considera cosechar antes si no puedes reducir la humedad a niveles seguros (idealmente por debajo del 50%). El riesgo de perder la cosecha aumenta cada día en estas condiciones.`
        );
      }

      // Recomendaciones específicas para cosecha inminente
      recommendations.push(
        `Tu ${variety.name} está en la fase final de maduración. Es crucial monitorear diariamente los tricomas con una lupa o microscopio para determinar el momento exacto de cosecha. Busca el porcentaje de tricomas ámbar que corresponda a tu preferencia de efecto (10-15% para equilibrado, 20-30% para relajante). Las condiciones climáticas actuales pueden ${temperatureImpact === ImpactLevel.POSITIVE ? 'favorecer' : 'alterar'} la maduración final.`
      );
    }

    // Recomendaciones específicas para la variedad
    if (variety.type === 'Indica' && humidityImpact !== ImpactLevel.POSITIVE) {
      recommendations.push(
        'Las variedades Indica son más susceptibles a problemas de moho. Presta especial atención a la ventilación y los niveles de humedad.'
      );
    } else if (variety.type === 'Sativa' && temperatureImpact !== ImpactLevel.POSITIVE) {
      recommendations.push(
        'Las variedades Sativa prefieren temperaturas más cálidas. Asegúrate de mantener temperaturas adecuadas, especialmente durante la noche.'
      );
    }

    // Si no hay recomendaciones específicas, agregar una general
    if (recommendations.length === 0) {
      if (temperatureImpact === ImpactLevel.POSITIVE &&
        humidityImpact === ImpactLevel.POSITIVE &&
        uvImpact === ImpactLevel.POSITIVE) {
        recommendations.push(
          'Las condiciones climáticas actuales son óptimas para el desarrollo de la planta en su etapa actual.'
        );
      } else {
        recommendations.push(
          'Las condiciones climáticas actuales son aceptables, pero mantén un monitoreo regular de la planta.'
        );
      }
    }

    return recommendations;
  }

  /**
   * Calcula el ajuste recomendado en días para la cosecha basado en las condiciones climáticas
   */
  private calculateHarvestAdjustment(
    overallImpact: ImpactLevel,
    weatherData: WeatherData,
    ripenessLevel: 'Temprano' | 'Medio' | 'Tardío'
  ): number {
    // No ajustar si no hay pronóstico disponible
    if (!weatherData.forecast || weatherData.forecast.length === 0) {
      return 0;
    }

    // Para plantas en etapa tardía, considerar cosecha inmediata en condiciones críticas
    if (ripenessLevel === 'Tardío' && overallImpact === ImpactLevel.CRITICAL) {
      return -999; // Código especial para indicar cosecha inmediata
    }

    // Analizar el pronóstico para los próximos días
    const nextDaysForecast = weatherData.forecast.slice(0, 7); // Analizar hasta 7 días

    // Verificar condiciones de alta humedad en el pronóstico
    const highHumidityDays = nextDaysForecast.filter(day => day.humidity > 70).length;

    // Verificar condiciones de temperatura extrema en el pronóstico
    const highTempDays = nextDaysForecast.filter(day => day.temperature_max > 30).length;
    const lowTempDays = nextDaysForecast.filter(day => day.temperature_min < 15).length;

    // Verificar condiciones de precipitación
    const rainDays = nextDaysForecast.filter(day => day.precipitation_probability > 60).length;

    // Calcular ajuste basado en las condiciones pronosticadas
    let adjustment = 0;

    // Ajustar según la humedad pronosticada
    if (highHumidityDays >= 2) {
      if (ripenessLevel === 'Tardío') {
        // En etapa tardía, la alta humedad es muy peligrosa (riesgo de moho)
        adjustment -= highHumidityDays;
      } else if (ripenessLevel === 'Medio') {
        // En etapa media, la alta humedad es preocupante pero menos crítica
        adjustment -= Math.ceil(highHumidityDays / 2);
      }
    }

    // Ajustar según la temperatura pronosticada
    if (highTempDays >= 2) {
      // Las altas temperaturas pueden acelerar la maduración
      adjustment -= Math.ceil(highTempDays / 2);
    }

    if (lowTempDays >= 3) {
      // Las bajas temperaturas pueden retrasar la maduración
      adjustment += Math.ceil(lowTempDays / 3);
    }

    // Ajustar según la precipitación pronosticada
    if (rainDays >= 2 && ripenessLevel !== 'Temprano') {
      // La lluvia aumenta el riesgo de moho en etapas avanzadas
      adjustment -= rainDays;
    }

    // Limitar el ajuste según el nivel de madurez
    if (ripenessLevel === 'Temprano') {
      // En etapa temprana, no recomendar adelantar más de 3 días
      adjustment = Math.max(adjustment, -3);
    } else if (ripenessLevel === 'Medio') {
      // En etapa media, no recomendar adelantar más de 5 días
      adjustment = Math.max(adjustment, -5);
    }

    return adjustment;
  }
}
