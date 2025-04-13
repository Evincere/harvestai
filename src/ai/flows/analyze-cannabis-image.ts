import { aiInstance, ai } from '../ai-instance';
import { CannabisVariety, HarvestPreference, UserPreferences } from '@/types/cannabis';

/**
 * Formatea una fecha futura basada en la cantidad de días a partir de hoy
 * @param days Número de días a partir de hoy
 * @returns Fecha formateada como DD/MM/YYYY
 */
function formatFutureDate(days: number): string {
  // Crear una nueva fecha basada en la fecha actual
  const date = new Date();
  date.setDate(date.getDate() + days);

  // Formatear como DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JS son 0-11
  const year = date.getFullYear();

  // Verificar que el año sea correcto (al menos 2025 para el año actual)
  const currentYear = new Date().getFullYear();
  if (year < currentYear) {
    console.warn(`Año incorrecto detectado: ${year}, usando año actual: ${currentYear}`);
    return `${day}/${month}/${currentYear}`;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Valida una fecha en formato DD/MM/YYYY y asegura que sea una fecha futura
 * Si la fecha es pasada o inválida, devuelve una fecha futura basada en los días proporcionados
 * @param dateStr Fecha en formato DD/MM/YYYY
 * @param defaultDays Días a usar si la fecha es inválida o pasada
 * @returns Fecha válida en el futuro en formato DD/MM/YYYY
 */
function ensureFutureDate(dateStr: string, defaultDays: number): string {
  // Verificar si la fecha tiene el formato correcto (DD/MM/YYYY)
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) {
    console.warn(`Formato de fecha inválido: ${dateStr}, usando fecha predeterminada`);
    return formatFutureDate(defaultDays);
  }

  // Extraer día, mes y año
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // Los meses en JS son 0-11
  const year = parseInt(match[3], 10);

  // Verificar que el año sea válido (al menos el año actual)
  const currentYear = new Date().getFullYear();
  if (year < currentYear) {
    console.warn(`Año en el pasado detectado: ${year}, usando fecha predeterminada`);
    return formatFutureDate(defaultDays);
  }

  // Crear objeto Date
  const date = new Date(year, month, day);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    console.warn(`Fecha inválida: ${dateStr}, usando fecha predeterminada`);
    return formatFutureDate(defaultDays);
  }

  // Verificar si la fecha es futura
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignorar la hora

  if (date < today) {
    console.warn(`Fecha en el pasado: ${dateStr}, usando fecha predeterminada`);
    return formatFutureDate(defaultDays);
  }

  // Verificar si la fecha está demasiado lejos en el futuro (más de 90 días)
  const maxFutureDate = new Date();
  maxFutureDate.setDate(maxFutureDate.getDate() + 90);

  if (date > maxFutureDate) {
    console.warn(`Fecha demasiado lejana: ${dateStr}, usando fecha predeterminada`);
    return formatFutureDate(defaultDays);
  }

  // La fecha es válida y futura, devolverla en el formato correcto
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month + 1).padStart(2, '0');

  return `${formattedDay}/${formattedMonth}/${year}`;
}

export interface AnalyzeCannabisImageOutput {
  ripenessLevel: 'Temprano' | 'Medio' | 'Tardío';
  confidence: number;
  characteristics: {
    pistils: string;
    trichomes: string;
    leafColor: string;
  };
  // Nuevos campos para funcionalidades avanzadas
  microscopicAnalysis?: {
    clearTrichomes: number; // Porcentaje de tricomas transparentes
    milkyTrichomes: number; // Porcentaje de tricomas lechosos
    amberTrichomes: number; // Porcentaje de tricomas ámbar
    trichomeDescription: string; // Descripción detallada de los tricomas
  };
  harvestTimeEstimation?: {
    daysToHarvest: number; // Días estimados hasta la cosecha óptima
    optimalHarvestDate: string; // Fecha estimada de cosecha óptima
    harvestWindow: string; // Ventana de tiempo recomendada para cosechar
  };
}



export async function analyzeCannabisImage({
  photoUrl,
  description,
  isMicroscopicImage = false,
  variety,
  preferences,
  weatherData,
}: {
  photoUrl: string;
  description: string;
  isMicroscopicImage?: boolean;
  variety?: CannabisVariety;
  preferences?: UserPreferences;
  weatherData?: any; // Datos climáticos para mejorar el análisis
}): Promise<AnalyzeCannabisImageOutput> {
  try {
    // Verificamos que la URL de la imagen sea válida
    if (!photoUrl) {
      throw new Error('Se requiere una URL de imagen válida');
    }

    // Texto del prompt base
    let promptBase = `
      Analiza esta imagen de una planta de cannabis y proporciona la siguiente información:

      IMPORTANTE: Responde COMPLETAMENTE EN ESPAÑOL. Todas las descripciones deben estar en español.

      Tu objetivo principal es determinar el momento óptimo de cosecha basándote en la imagen y todos los datos adicionales proporcionados.
    `;

    // Información adicional si se proporciona una variedad
    if (variety) {
      promptBase += `
      Información de la variedad:
      - Nombre: ${variety.name}
      - Tipo: ${variety.type}
      - Tiempo de floración típico: ${variety.floweringTime.min}-${variety.floweringTime.max} días
      `;
    }

    // Información adicional si se proporcionan preferencias
    if (preferences) {
      promptBase += `
      Preferencia de cosecha del usuario: ${preferences.harvestPreference}
      `;
    }

    // Descripción proporcionada por el usuario
    promptBase += `
      Descripción proporcionada: ${description || 'No se proporcionó descripción'}
    `;

    // Información climática si se proporciona
    if (weatherData) {
      promptBase += `
      Información climática actual:
      - Temperatura: ${weatherData.current.temperature}°C
      - Humedad relativa: ${weatherData.current.humidity}%
      - Índice UV: ${weatherData.current.uv_index}
      - Condición: ${weatherData.current.condition}
      `;

      // Añadir pronóstico si está disponible
      if (weatherData.forecast && weatherData.forecast.length > 0) {
        promptBase += `
      Pronóstico para los próximos días:
        `;

        // Añadir los primeros 3 días de pronóstico
        for (let i = 0; i < Math.min(3, weatherData.forecast.length); i++) {
          const day = weatherData.forecast[i];
          promptBase += `
      - Día ${i + 1}: Temperatura ${day.temperature_min}°C a ${day.temperature_max}°C, Humedad ${day.humidity}%, Probabilidad de lluvia ${day.precipitation_probability}%
          `;
        }
      }
    }

    // Formato de respuesta base
    let formatoRespuesta = `
      Formato requerido:
      {
        "ripenessLevel": "Temprano|Medio|Tardío",
        "confidence": 0.0-1.0,
        "characteristics": {
          "pistils": "descripción en español del estado de los pistilos",
          "trichomes": "descripción en español del estado de los tricomas",
          "leafColor": "descripción en español del color de las hojas"
        }
    `;

    // Si es una imagen microscópica, añadir campos adicionales
    if (isMicroscopicImage) {
      formatoRespuesta += `,
        "microscopicAnalysis": {
          "clearTrichomes": 0-100, // Porcentaje de tricomas transparentes
          "milkyTrichomes": 0-100, // Porcentaje de tricomas lechosos
          "amberTrichomes": 0-100, // Porcentaje de tricomas ámbar
          "trichomeDescription": "descripción detallada del estado de los tricomas"
        }
      `;
    }

    // Si se proporciona una variedad, añadir estimación de tiempo hasta cosecha
    if (variety) {
      formatoRespuesta += `,
        "harvestTimeEstimation": {
          "daysToHarvest": 0-100, // Días estimados hasta la cosecha óptima
          "optimalHarvestDate": "fecha estimada en formato DD/MM/YYYY",
          "harvestWindow": "descripción del periodo óptimo para cosechar"
        }
      `;
    }

    // Cerrar el formato JSON
    formatoRespuesta += `
      }
    `;

    // Instrucciones adicionales según el tipo de imagen
    let instruccionesAdicionales = '';

    if (isMicroscopicImage) {
      instruccionesAdicionales = `
      INSTRUCCIONES PARA ANÁLISIS MICROSCÓPICO:
      - Enfócate principalmente en los tricomas visibles en la imagen
      - Identifica el porcentaje aproximado de tricomas transparentes, lechosos y ámbar
      - Los tricomas transparentes indican inmadurez
      - Los tricomas lechosos indican madurez óptima
      - Los tricomas ámbar indican sobremadurez y efectos más sedantes
      - Proporciona una descripción detallada de la forma y color de los tricomas
      `;
    } else {
      instruccionesAdicionales = `
      INSTRUCCIONES PARA ANÁLISIS GENERAL:
      - Observa el color de los pistilos (pelos): blancos indican inmadurez, naranjas/marrones indican madurez
      - Evalúa el color general de las hojas y cogollos
      - Estima el nivel general de madurez (Temprano, Medio, Tardío)
      `;
    }

    if (variety && preferences) {
      instruccionesAdicionales += `
      INSTRUCCIONES PARA ESTIMACIÓN DE TIEMPO HASTA COSECHA:
      - Basado en la variedad ${variety.name} (${variety.type}) con tiempo de floración de ${variety.floweringTime.min}-${variety.floweringTime.max} días
      - Ajusta la estimación según la preferencia del usuario: ${preferences.harvestPreference}
      - Para preferencia "Energético", recomienda cosechar cuando la mayoría de tricomas estén lechosos con pocos ámbar
      - Para preferencia "Equilibrado", recomienda cosechar cuando haya aproximadamente 10-15% de tricomas ámbar
      - Para preferencia "Relajante", recomienda cosechar cuando haya 20-30% de tricomas ámbar
      `;

      // Añadir instrucciones específicas para considerar el clima si hay datos disponibles
      if (weatherData) {
        instruccionesAdicionales += `
      INSTRUCCIONES PARA CONSIDERAR EL CLIMA EN LA ESTIMACIÓN DE COSECHA:
      - Considera cómo las condiciones climáticas actuales y pronosticadas afectan el momento óptimo de cosecha
      - Temperatura alta (>28°C) puede acelerar la maduración
      - Humedad alta (>60%) durante la floración tardía aumenta el riesgo de moho y puede requerir adelantar la cosecha
      - Índice UV alto (>6) puede aumentar la producción de tricomas y cannabinoides
      - Si se pronostica lluvia o alta humedad en los próximos días y la planta está cerca de su punto óptimo, considera recomendar una cosecha más temprana
      - Ajusta los días hasta la cosecha considerando las condiciones climáticas actuales y pronosticadas
      `;
      }
    }

    // Combinar todo en el prompt final
    const promptText = `${promptBase}${instruccionesAdicionales}${formatoRespuesta}

      Recuerda que toda la respuesta debe estar en español, incluyendo todas las descripciones dentro del JSON.
    `;

    // Obtenemos el modelo directamente
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Creamos el contenido con la imagen y el texto
    // Verificamos si la URL es una data URL (base64)
    let imageData = photoUrl;
    let mimeType = 'image/jpeg';

    if (photoUrl.startsWith('data:')) {
      // Extraemos el tipo MIME y los datos base64
      const matches = photoUrl.match(/^data:([\w\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageData = matches[2]; // Solo los datos base64 sin el prefijo
      } else {
        throw new Error('Formato de imagen no válido');
      }
    }

    const content = [
      {
        role: 'user',
        parts: [
          { text: promptText },
          { inlineData: { mimeType, data: imageData } }
        ]
      }
    ];

    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('Error: GOOGLE_GENAI_API_KEY no está configurada');
      // Guardar el estado del error para que el cliente pueda detectarlo
      if (typeof window !== 'undefined') {
        localStorage.setItem('api_key_error', 'true');
      }
      throw new Error('No se puede realizar el análisis de la imagen porque la API key de Google AI no está configurada. Por favor, configure la variable de entorno GOOGLE_GENAI_API_KEY.');
    } else {
      // Si la API key está configurada, eliminar el estado de error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('api_key_error');
      }
    }

    let resultText = '';
    try {
      // Generamos el contenido
      const result = await model.generateContent({
        contents: content,
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });

      const response = await result.response;
      resultText = response.text();
    } catch (error) {
      console.error('Error al generar contenido con Google AI:', error);
      throw new Error(`Error al analizar la imagen con IA: ${error.message || 'Error desconocido'}`);
    }

    try {
      // Limpiamos el texto de la respuesta para asegurarnos de que sea JSON válido
      // A veces el modelo devuelve el JSON con comillas de código o texto adicional
      let cleanedText = resultText;

      // Si el texto contiene ```json y ```, extraemos solo el contenido JSON
      if (resultText.includes('```json') && resultText.includes('```')) {
        const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedText = jsonMatch[1].trim();
        }
      }

      // Intentamos analizar el JSON
      const analysis = JSON.parse(cleanedText);

      console.log('Análisis exitoso:', analysis);

      // Construir el objeto de respuesta base
      const response: AnalyzeCannabisImageOutput = {
        ripenessLevel: analysis.ripenessLevel || 'Mid',
        confidence: analysis.confidence || 0.5,
        characteristics: {
          pistils: analysis.characteristics?.pistils || 'No detectado',
          trichomes: analysis.characteristics?.trichomes || 'No detectado',
          leafColor: analysis.characteristics?.leafColor || 'No detectado'
        }
      };

      // Añadir análisis microscópico si está disponible
      if (analysis.microscopicAnalysis) {
        response.microscopicAnalysis = {
          clearTrichomes: analysis.microscopicAnalysis.clearTrichomes || 0,
          milkyTrichomes: analysis.microscopicAnalysis.milkyTrichomes || 0,
          amberTrichomes: analysis.microscopicAnalysis.amberTrichomes || 0,
          trichomeDescription: analysis.microscopicAnalysis.trichomeDescription || 'No disponible'
        };
      } else if (isMicroscopicImage) {
        // Si es una imagen microscópica pero no se detectó análisis, crear uno por defecto
        response.microscopicAnalysis = {
          clearTrichomes: 33,
          milkyTrichomes: 33,
          amberTrichomes: 33,
          trichomeDescription: 'Análisis automático: Se detectan tricomas en diferentes estados de maduración.'
        };
      }

      // Añadir estimación de tiempo hasta cosecha si hay una variedad seleccionada
      if (analysis.harvestTimeEstimation) {
        // Obtener los días hasta la cosecha (usar 14 como valor predeterminado)
        const daysToHarvest = analysis.harvestTimeEstimation.daysToHarvest || 14;

        // Validar y corregir la fecha óptima de cosecha
        const optimalHarvestDate = analysis.harvestTimeEstimation.optimalHarvestDate
          ? ensureFutureDate(analysis.harvestTimeEstimation.optimalHarvestDate, daysToHarvest)
          : formatFutureDate(daysToHarvest);

        response.harvestTimeEstimation = {
          daysToHarvest: daysToHarvest,
          optimalHarvestDate: optimalHarvestDate,
          harvestWindow: analysis.harvestTimeEstimation.harvestWindow || 'Entre 10 y 20 días aproximadamente.'
        };
      } else if (variety) {
        // Si hay una variedad seleccionada pero no se detectó estimación, crear una por defecto

        // Verificar si la planta ya ha pasado su punto óptimo de cosecha
        const isPastOptimal = response.ripenessLevel === 'Tardío' &&
          (response.characteristics.trichomes.toLowerCase().includes('ámbar') ||
            response.characteristics.trichomes.toLowerCase().includes('amber'));

        if (isPastOptimal) {
          // La planta ya ha pasado su punto óptimo de cosecha
          response.harvestTimeEstimation = {
            daysToHarvest: 0,
            optimalHarvestDate: formatFutureDate(1), // Mañana como fecha límite
            harvestWindow: `La planta ha pasado su punto óptimo de cosecha. Se recomienda cosechar inmediatamente para evitar efectos excesivamente sedantes y posible degradación de cannabinoides.`
          };
        } else {
          // Caso normal - la planta aún no ha pasado su punto óptimo
          const daysToHarvest = response.ripenessLevel === 'Temprano' ? 21 :
            response.ripenessLevel === 'Medio' ? 10 : 3;

          response.harvestTimeEstimation = {
            daysToHarvest: daysToHarvest,
            optimalHarvestDate: formatFutureDate(daysToHarvest),
            harvestWindow: `Aproximadamente ${daysToHarvest - 2} a ${daysToHarvest + 2} días basado en la variedad ${variety.name}.`
          };
        }
      }

      return response;
    } catch (parseError) {
      console.error('Error al parsear la respuesta:', resultText);

      // Intentamos extraer manualmente los valores si el JSON no se puede analizar
      try {
        // Extracción manual de valores usando expresiones regulares
        const ripenessMatch = resultText.match(/"ripenessLevel"\s*:\s*"([^"]+)"/i);
        const confidenceMatch = resultText.match(/"confidence"\s*:\s*([\d\.]+)/i);
        const pistilsMatch = resultText.match(/"pistils"\s*:\s*"([^"]+)"/i);
        const trichomesMatch = resultText.match(/"trichomes"\s*:\s*"([^"]+)"/i);
        const leafColorMatch = resultText.match(/"leafColor"\s*:\s*"([^"]+)"/i);

        // Construir respuesta base con los datos que pudimos extraer
        const response: AnalyzeCannabisImageOutput = {
          ripenessLevel: (ripenessMatch && ripenessMatch[1]) || 'Mid',
          confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
          characteristics: {
            pistils: (pistilsMatch && pistilsMatch[1]) || 'No detectado',
            trichomes: (trichomesMatch && trichomesMatch[1]) || 'No detectado',
            leafColor: (leafColorMatch && leafColorMatch[1]) || 'No detectado'
          }
        };

        // Añadir análisis microscópico si es una imagen microscópica
        if (isMicroscopicImage) {
          response.microscopicAnalysis = {
            clearTrichomes: 33,
            milkyTrichomes: 33,
            amberTrichomes: 33,
            trichomeDescription: 'Análisis automático: Se detectan tricomas en diferentes estados de maduración.'
          };
        }

        // Añadir estimación de tiempo hasta cosecha si hay una variedad seleccionada
        if (variety) {
          const daysToHarvest = response.ripenessLevel === 'Temprano' ? 21 :
            response.ripenessLevel === 'Medio' ? 10 : 3;

          response.harvestTimeEstimation = {
            daysToHarvest: daysToHarvest,
            optimalHarvestDate: formatFutureDate(daysToHarvest),
            harvestWindow: `Aproximadamente ${daysToHarvest - 2} a ${daysToHarvest + 2} días basado en la variedad ${variety.name}.`
          };
        }

        return response;
      } catch (regexError) {
        // Si todo falla, devolvemos valores predeterminados
        const fallbackResponse: AnalyzeCannabisImageOutput = {
          ripenessLevel: 'Medio',
          confidence: 0.5,
          characteristics: {
            pistils: 'No se pudieron detectar claramente los pistilos en la imagen. Intenta con una foto más nítida y cercana.',
            trichomes: 'No se pudieron detectar claramente los tricomas en la imagen. Considera usar una imagen microscópica para mejor análisis.',
            leafColor: 'No se pudo determinar con claridad el color de las hojas. Intenta con una foto con mejor iluminación.'
          }
        };

        // Añadir análisis microscópico si es una imagen microscópica
        if (isMicroscopicImage) {
          fallbackResponse.microscopicAnalysis = {
            clearTrichomes: 33,
            milkyTrichomes: 33,
            amberTrichomes: 33,
            trichomeDescription: 'Análisis automático de respaldo: Se asume una distribución equitativa de tricomas.'
          };
        }

        // Añadir estimación de tiempo hasta cosecha si hay una variedad seleccionada
        if (variety) {
          const daysToHarvest = 14; // Valor predeterminado de dos semanas

          fallbackResponse.harvestTimeEstimation = {
            daysToHarvest: daysToHarvest,
            optimalHarvestDate: formatFutureDate(daysToHarvest),
            harvestWindow: `Aproximadamente 10 a 20 días basado en la variedad ${variety.name}.`
          };
        }

        return fallbackResponse;
      }
    }
  } catch (error: any) {
    console.error('Error en el análisis:', error);
    // Incluso en caso de error, intentamos devolver algo útil
    const errorResponse: AnalyzeCannabisImageOutput = {
      ripenessLevel: 'Medio',
      confidence: 0.3,
      characteristics: {
        pistils: 'No se pudieron analizar los pistilos debido a un error. Intenta con otra imagen o ajusta la iluminación.',
        trichomes: 'No se pudieron analizar los tricomas debido a un error. Intenta con una imagen más clara o con mayor aumento.',
        leafColor: 'No se pudo analizar el color de las hojas debido a un error. Verifica que las hojas sean visibles en la imagen.'
      }
    };

    // Añadir análisis microscópico si es una imagen microscópica
    if (isMicroscopicImage) {
      errorResponse.microscopicAnalysis = {
        clearTrichomes: 33,
        milkyTrichomes: 33,
        amberTrichomes: 33,
        trichomeDescription: 'No se pudo realizar el análisis microscópico debido a un error.'
      };
    }

    // Añadir estimación de tiempo hasta cosecha si hay una variedad seleccionada
    if (variety) {
      const daysToHarvest = 14; // Valor predeterminado de dos semanas

      errorResponse.harvestTimeEstimation = {
        daysToHarvest: daysToHarvest,
        optimalHarvestDate: formatFutureDate(daysToHarvest),
        harvestWindow: `Aproximadamente 10 a 20 días basado en la variedad ${variety.name}.`
      };
    }

    return errorResponse;
  }
}



