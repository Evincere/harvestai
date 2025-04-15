import { ai } from '../ai-instance';
import { CannabisVariety, UserPreferences } from '@/types/cannabis';

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

  // Asegurarse de que el año sea correcto (al menos el año actual)
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
  console.log(`Validando fecha: ${dateStr}`);

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
    console.warn(`Año en el pasado detectado: ${year}, usando fecha predeterminada con año ${currentYear}`);

    // Intentar mantener el mismo día y mes, pero con el año correcto
    const correctedDate = new Date(currentYear, month, day);

    // Verificar si la fecha corregida es válida
    if (!isNaN(correctedDate.getTime())) {
      const correctedDay = String(correctedDate.getDate()).padStart(2, '0');
      const correctedMonth = String(correctedDate.getMonth() + 1).padStart(2, '0');

      // Verificar si la fecha corregida es futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (correctedDate >= today) {
        return `${correctedDay}/${correctedMonth}/${currentYear}`;
      }
    }

    // Si la fecha corregida no es válida o no es futura, usar la fecha predeterminada
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

// Definir la interfaz para el resultado del análisis
export interface AnalyzeCannabisImageOutput {
  ripenessLevel: 'Temprano' | 'Medio' | 'Tardío';
  confidence: number;
  characteristics: {
    pistils: string;
    trichomes: string;
    leafColor: string;
  };
  harvestTimeEstimation?: {
    daysToHarvest: number;
    optimalHarvestDate: string;
    harvestWindow: string;
  };
  microscopicAnalysis?: {
    clearTrichomes: number;
    milkyTrichomes: number;
    amberTrichomes: number;
    trichomeDescription: string;
  };
}

/**
 * Analiza una imagen general de cannabis
 */
async function analyzeGeneralImage(
  photoUrl: string,
  description: string,
  variety?: CannabisVariety,
  preferences?: UserPreferences,
  weatherData?: any
): Promise<AnalyzeCannabisImageOutput> {
  try {
    // Verificamos que la URL de la imagen sea válida
    if (!photoUrl) {
      throw new Error('Se requiere una URL de imagen general válida');
    }

    // Texto del prompt base
    let promptBase = `
      Analiza esta imagen de una planta de cannabis y proporciona la siguiente información:
      - Estado de los pistilos (pelos)
      - Estado de los tricomas (si son visibles)
      - Color de las hojas
      - Nivel general de madurez (Temprano, Medio, Tardío)
      - Cualquier signo de deficiencia, enfermedad o estrés

      ${description ? `Información adicional proporcionada por el usuario: ${description}` : ''}
    `;

    // Formato de respuesta base para la imagen general
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

    // Si se proporciona una variedad, añadir estimación de tiempo hasta cosecha
    if (variety) {
      formatoRespuesta += `,
        "harvestTimeEstimation": {
          "daysToHarvest": 0-100, // Días estimados hasta la cosecha óptima
          "optimalHarvestDate": "fecha estimada en formato DD/MM/YYYY",
          "harvestWindow": "descripción del periodo óptimo para cosechar"
        }
      `;
    } else {
      formatoRespuesta += `
      }`;
    }

    // Instrucciones adicionales
    let instruccionesAdicionales = `
      INSTRUCCIONES PARA ANÁLISIS GENERAL:
      - Observa el color de los pistilos (pelos): blancos indican inmadurez, naranjas/marrones indican madurez
      - Evalúa el color general de las hojas y cogollos
      - Estima el nivel general de madurez (Temprano, Medio, Tardío)
    `;

    // Obtener la fecha actual para incluirla en las instrucciones
    const currentDate = new Date();
    const formattedCurrentDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    if (variety && preferences) {
      // Verificar si es la variedad "Desconocida/Otra"
      const isUnknownVariety = variety.id === 'unknown';

      instruccionesAdicionales += `
      INSTRUCCIONES PARA ESTIMACIÓN DE TIEMPO HASTA COSECHA:
      - La fecha actual es: ${formattedCurrentDate}
      - Basado en la variedad ${variety.name} (${variety.type}) con tiempo de floración de ${variety.floweringTime.min}-${variety.floweringTime.max} días
      ${isUnknownVariety ? '- NOTA: Se están usando valores promedio para una variedad desconocida' : ''}
      - Ajusta la estimación según la preferencia del usuario: ${preferences.harvestPreference}
      - Para preferencia "Energético", recomienda cosechar cuando la mayoría de tricomas estén lechosos con pocos ámbar
      - Para preferencia "Equilibrado", recomienda cosechar cuando haya aproximadamente 10-15% de tricomas ámbar
      - Para preferencia "Relajante", recomienda cosechar cuando haya 20-30% de tricomas ámbar
      - IMPORTANTE: Asegúrate de que la fecha óptima de cosecha sea posterior a la fecha actual y esté en el año ${currentDate.getFullYear()} o posterior
      ${isUnknownVariety ? '- Debido a que la variedad es desconocida, proporciona un rango más amplio para la ventana de cosecha' : ''}
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
        `;
      }
    }

    // Texto completo del prompt
    const promptText = `${promptBase}\n${formatoRespuesta}\n${instruccionesAdicionales}`;

    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('Error: GOOGLE_GENAI_API_KEY no está configurada');
      throw new Error('No se puede realizar el análisis de la imagen porque la API key de Google AI no está configurada. Por favor, configure la variable de entorno GOOGLE_GENAI_API_KEY.');
    }

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

    // Generamos el contenido
    let resultText = '';
    try {
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
    } catch (error: any) {
      console.error('Error al generar contenido con Google AI:', error);
      throw new Error(`Error al analizar la imagen con IA: ${error.message || 'Error desconocido'}`);
    }

    // Extraer el JSON de la respuesta
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonText = jsonMatch[0];
      // Limpiar el texto JSON (eliminar comillas no válidas, etc.)
      const cleanedText = jsonText.replace(/\\'/g, "'").replace(/\\n/g, "\n");

      try {
        // Intentamos analizar el JSON
        const analysis = JSON.parse(cleanedText);

        console.log('Análisis general exitoso:', analysis);

        // Construir el objeto de respuesta base
        const response: AnalyzeCannabisImageOutput = {
          ripenessLevel: analysis.ripenessLevel || 'Medio',
          confidence: analysis.confidence || 0.5,
          characteristics: {
            pistils: analysis.characteristics?.pistils || 'No detectado',
            trichomes: analysis.characteristics?.trichomes || 'No detectado',
            leafColor: analysis.characteristics?.leafColor || 'No detectado'
          }
        };

        // Añadir estimación de tiempo hasta cosecha si está disponible
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
        }

        return response;
      } catch (jsonError) {
        console.error('Error al analizar JSON:', jsonError);
        throw new Error('No se pudo analizar la respuesta de la IA. Intenta con otra imagen.');
      }
    } else {
      console.error('No se encontró JSON en la respuesta:', resultText);
      throw new Error('Formato de respuesta inválido. Intenta con otra imagen.');
    }
  } catch (error) {
    console.error('Error en el análisis general:', error);
    throw error;
  }
}

/**
 * Analiza una imagen microscópica de tricomas de cannabis
 */
async function analyzeMicroscopicImage(
  photoUrl: string,
  variety?: CannabisVariety,
  preferences?: UserPreferences
): Promise<{
  microscopicAnalysis: {
    clearTrichomes: number;
    milkyTrichomes: number;
    amberTrichomes: number;
    trichomeDescription: string;
  };
  ripenessLevel: 'Temprano' | 'Medio' | 'Tardío';
  confidence: number;
}> {
  try {
    // Verificamos que la URL de la imagen sea válida
    if (!photoUrl) {
      throw new Error('Se requiere una URL de imagen microscópica válida');
    }

    // Texto del prompt base
    let promptBase = `
      Analiza esta imagen microscópica de tricomas de cannabis y proporciona la siguiente información:
      - Porcentaje aproximado de tricomas transparentes
      - Porcentaje aproximado de tricomas lechosos (blancos/opacos)
      - Porcentaje aproximado de tricomas ámbar (marrones/rojizos)
      - Descripción detallada del estado de los tricomas
      - Nivel de madurez basado en los tricomas (Temprano, Medio, Tardío)
    `;

    // Formato de respuesta para la imagen microscópica
    let formatoRespuesta = `
      Formato requerido:
      {
        "microscopicAnalysis": {
          "clearTrichomes": 0-100, // Porcentaje de tricomas transparentes
          "milkyTrichomes": 0-100, // Porcentaje de tricomas lechosos
          "amberTrichomes": 0-100, // Porcentaje de tricomas ámbar
          "trichomeDescription": "descripción detallada del estado de los tricomas"
        },
        "ripenessLevel": "Temprano|Medio|Tardío",
        "confidence": 0.0-1.0
      }
    `;

    // Instrucciones adicionales
    let instruccionesAdicionales = `
      INSTRUCCIONES PARA ANÁLISIS MICROSCÓPICO:
      - Enfócate principalmente en los tricomas visibles en la imagen
      - Identifica el porcentaje aproximado de tricomas transparentes, lechosos y ámbar
      - Los tricomas transparentes indican inmadurez
      - Los tricomas lechosos indican madurez óptima
      - Los tricomas ámbar indican sobremadurez y efectos más sedantes
      - Proporciona una descripción detallada de la forma y color de los tricomas
      - Estima el nivel de madurez basado SOLO en los tricomas (Temprano, Medio, Tardío)
    `;

    // Obtener la fecha actual para incluirla en las instrucciones
    const currentDate = new Date();
    const formattedCurrentDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    if (preferences) {
      instruccionesAdicionales += `
      INSTRUCCIONES PARA PREFERENCIAS DE USUARIO:
      - La fecha actual es: ${formattedCurrentDate}
      - Preferencia del usuario: ${preferences.harvestPreference}
      - Para preferencia "Energético", el momento óptimo es cuando la mayoría de tricomas están lechosos con pocos ámbar (0-10%)
      - Para preferencia "Equilibrado", el momento óptimo es cuando hay aproximadamente 10-15% de tricomas ámbar
      - Para preferencia "Relajante", el momento óptimo es cuando hay 20-30% de tricomas ámbar
      `;
    }

    // Texto completo del prompt
    const promptText = `${promptBase}\n${formatoRespuesta}\n${instruccionesAdicionales}`;

    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('Error: GOOGLE_GENAI_API_KEY no está configurada');
      throw new Error('No se puede realizar el análisis de la imagen porque la API key de Google AI no está configurada. Por favor, configure la variable de entorno GOOGLE_GENAI_API_KEY.');
    }

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

    // Generamos el contenido
    let resultText = '';
    try {
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
    } catch (error: any) {
      console.error('Error al generar contenido con Google AI:', error);
      throw new Error(`Error al analizar la imagen microscópica con IA: ${error.message || 'Error desconocido'}`);
    }

    // Extraer el JSON de la respuesta
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonText = jsonMatch[0];
      // Limpiar el texto JSON (eliminar comillas no válidas, etc.)
      const cleanedText = jsonText.replace(/\\'/g, "'").replace(/\\n/g, "\n");

      try {
        // Intentamos analizar el JSON
        const analysis = JSON.parse(cleanedText);

        console.log('Análisis microscópico exitoso:', analysis);

        // Verificar que los porcentajes sumen aproximadamente 100%
        const clearPercentage = analysis.microscopicAnalysis?.clearTrichomes || 0;
        const milkyPercentage = analysis.microscopicAnalysis?.milkyTrichomes || 0;
        const amberPercentage = analysis.microscopicAnalysis?.amberTrichomes || 0;

        const total = clearPercentage + milkyPercentage + amberPercentage;
        if (total < 95 || total > 105) {
          // Ajustar los porcentajes para que sumen 100%
          const factor = 100 / total;
          return {
            microscopicAnalysis: {
              clearTrichomes: Math.round(clearPercentage * factor),
              milkyTrichomes: Math.round(milkyPercentage * factor),
              amberTrichomes: Math.round(100 - Math.round(clearPercentage * factor) - Math.round(milkyPercentage * factor)),
              trichomeDescription: analysis.microscopicAnalysis?.trichomeDescription || 'Descripción no disponible'
            },
            ripenessLevel: analysis.ripenessLevel || 'Medio',
            confidence: analysis.confidence || 0.5
          };
        }

        return {
          microscopicAnalysis: {
            clearTrichomes: clearPercentage,
            milkyTrichomes: milkyPercentage,
            amberTrichomes: amberPercentage,
            trichomeDescription: analysis.microscopicAnalysis?.trichomeDescription || 'Descripción no disponible'
          },
          ripenessLevel: analysis.ripenessLevel || 'Medio',
          confidence: analysis.confidence || 0.5
        };
      } catch (jsonError) {
        console.error('Error al analizar JSON microscópico:', jsonError);
        throw new Error('No se pudo analizar la respuesta de la IA para la imagen microscópica.');
      }
    } else {
      console.error('No se encontró JSON en la respuesta microscópica:', resultText);
      throw new Error('Formato de respuesta inválido para la imagen microscópica.');
    }
  } catch (error) {
    console.error('Error en el análisis microscópico:', error);
    throw error;
  }
}

/**
 * Combina los resultados del análisis general y microscópico
 */
function combineAnalysisResults(
  generalResult: AnalyzeCannabisImageOutput,
  microscopicResult: {
    microscopicAnalysis: {
      clearTrichomes: number;
      milkyTrichomes: number;
      amberTrichomes: number;
      trichomeDescription: string;
    };
    ripenessLevel: 'Temprano' | 'Medio' | 'Tardío';
    confidence: number;
  }
): AnalyzeCannabisImageOutput {
  // Combinar nivel de madurez (dar más peso al análisis microscópico para determinar el nivel de madurez)
  let combinedRipenessLevel = generalResult.ripenessLevel;

  // Si el nivel de madurez difiere entre los análisis, usar el microscópico
  if (generalResult.ripenessLevel !== microscopicResult.ripenessLevel) {
    // Dar prioridad al análisis microscópico para el nivel de madurez
    combinedRipenessLevel = microscopicResult.ripenessLevel;

    // Ajustar la descripción de tricomas en el análisis general
    generalResult.characteristics.trichomes = `Análisis general: ${generalResult.characteristics.trichomes}. Análisis microscópico: ${microscopicResult.microscopicAnalysis.trichomeDescription}`;
  }

  // Combinar nivel de confianza (promedio ponderado, dando más peso al microscópico)
  const combinedConfidence = (generalResult.confidence * 0.4) + (microscopicResult.confidence * 0.6);

  // Ajustar la estimación de tiempo hasta la cosecha si está disponible
  if (generalResult.harvestTimeEstimation) {
    // Ajustar días hasta la cosecha basado en el análisis microscópico
    let adjustedDaysToHarvest = generalResult.harvestTimeEstimation.daysToHarvest;

    // Ajustar basado en el porcentaje de tricomas ámbar
    const amberPercentage = microscopicResult.microscopicAnalysis.amberTrichomes;

    if (amberPercentage > 30) {
      // Muchos tricomas ámbar indican que la cosecha debe ser inmediata
      adjustedDaysToHarvest = 0;
    } else if (amberPercentage > 20) {
      // Reducir el tiempo estimado
      adjustedDaysToHarvest = Math.max(0, Math.floor(adjustedDaysToHarvest * 0.5));
    } else if (amberPercentage > 10) {
      // Reducir ligeramente el tiempo estimado
      adjustedDaysToHarvest = Math.max(0, Math.floor(adjustedDaysToHarvest * 0.8));
    }

    // Actualizar la fecha óptima de cosecha
    const optimalHarvestDate = formatFutureDate(adjustedDaysToHarvest);

    // Actualizar la ventana de cosecha
    let harvestWindow = generalResult.harvestTimeEstimation.harvestWindow;
    if (adjustedDaysToHarvest !== generalResult.harvestTimeEstimation.daysToHarvest) {
      harvestWindow = `Basado en el análisis microscópico, se ha ajustado la estimación. ${adjustedDaysToHarvest === 0 ? 'Se recomienda cosechar inmediatamente.' : `Se recomienda cosechar en aproximadamente ${adjustedDaysToHarvest} días.`}`;
    }

    generalResult.harvestTimeEstimation = {
      daysToHarvest: adjustedDaysToHarvest,
      optimalHarvestDate,
      harvestWindow
    };
  }

  // Devolver el resultado combinado
  return {
    ...generalResult,
    ripenessLevel: combinedRipenessLevel,
    confidence: combinedConfidence,
    microscopicAnalysis: microscopicResult.microscopicAnalysis
  };
}

/**
 * Función principal que analiza imágenes de cannabis
 */
export async function analyzeCannabisImage({
  photoUrl,
  microscopicPhotoUrl,
  description,
  variety,
  preferences,
  weatherData,
}: {
  photoUrl: string;
  microscopicPhotoUrl?: string;
  description: string;
  variety?: CannabisVariety;
  preferences?: UserPreferences;
  weatherData?: any; // Datos climáticos para mejorar el análisis
}): Promise<AnalyzeCannabisImageOutput> {
  try {
    // Verificamos que al menos la URL de la imagen general sea válida
    if (!photoUrl) {
      throw new Error('Se requiere una URL de imagen general válida');
    }

    // Verificar si tenemos una imagen microscópica
    const hasMicroscopicImage = !!microscopicPhotoUrl;

    // Analizar la imagen general
    const generalResult = await analyzeGeneralImage(photoUrl, description, variety, preferences, weatherData);

    // Si no hay imagen microscópica, devolver solo el resultado general
    if (!hasMicroscopicImage) {
      return generalResult;
    }

    try {
      // Analizar la imagen microscópica
      const microscopicResult = await analyzeMicroscopicImage(microscopicPhotoUrl!, variety, preferences);

      // Combinar los resultados
      return combineAnalysisResults(generalResult, microscopicResult);
    } catch (microscopicError) {
      console.error('Error en el análisis microscópico:', microscopicError);
      // Si falla el análisis microscópico, devolver solo el resultado general
      return generalResult;
    }
  } catch (error) {
    console.error('Error en el análisis de cannabis:', error);
    throw error;
  }
}
