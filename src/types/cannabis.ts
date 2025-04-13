// Tipos para las variedades de cannabis
export type CannabisType = 'Sativa' | 'Indica' | 'Híbrido';

export interface CannabisVariety {
  id: string;
  name: string;
  type: CannabisType;
  floweringTime: {
    min: number; // Tiempo mínimo de floración en días
    max: number; // Tiempo máximo de floración en días
  };
  characteristics: {
    pistilsMaturationRate: number; // 1-10, donde 10 es muy rápido
    trichomesDevelopmentRate: number; // 1-10, donde 10 es muy rápido
    leafColorChangeRate: number; // 1-10, donde 10 es muy rápido
  };
  description: string;
}

// Base de datos de variedades comunes
export const CANNABIS_VARIETIES: CannabisVariety[] = [
  {
    id: 'og-kush',
    name: 'OG Kush',
    type: 'Híbrido',
    floweringTime: { min: 56, max: 70 },
    characteristics: {
      pistilsMaturationRate: 7,
      trichomesDevelopmentRate: 8,
      leafColorChangeRate: 6
    },
    description: 'Híbrido potente con notas cítricas y pino. Floración media-rápida.'
  },
  {
    id: 'blue-dream',
    name: 'Blue Dream',
    type: 'Híbrido',
    floweringTime: { min: 65, max: 75 },
    characteristics: {
      pistilsMaturationRate: 6,
      trichomesDevelopmentRate: 7,
      leafColorChangeRate: 5
    },
    description: 'Híbrido sativa-dominante con sabor a bayas. Floración media.'
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    type: 'Indica',
    floweringTime: { min: 45, max: 55 },
    characteristics: {
      pistilsMaturationRate: 8,
      trichomesDevelopmentRate: 9,
      leafColorChangeRate: 7
    },
    description: 'Indica clásica de floración rápida con efecto relajante profundo.'
  },
  {
    id: 'sour-diesel',
    name: 'Sour Diesel',
    type: 'Sativa',
    floweringTime: { min: 70, max: 85 },
    characteristics: {
      pistilsMaturationRate: 5,
      trichomesDevelopmentRate: 6,
      leafColorChangeRate: 4
    },
    description: 'Sativa energética con aroma a combustible. Floración larga.'
  },
  {
    id: 'white-widow',
    name: 'White Widow',
    type: 'Híbrido',
    floweringTime: { min: 55, max: 65 },
    characteristics: {
      pistilsMaturationRate: 7,
      trichomesDevelopmentRate: 9,
      leafColorChangeRate: 6
    },
    description: 'Híbrido equilibrado cubierto de tricomas blancos. Floración media.'
  },
  {
    id: 'amnesia-haze',
    name: 'Amnesia Haze',
    type: 'Sativa',
    floweringTime: { min: 80, max: 95 },
    characteristics: {
      pistilsMaturationRate: 4,
      trichomesDevelopmentRate: 5,
      leafColorChangeRate: 3
    },
    description: 'Sativa cerebral con sabor cítrico y especiado. Floración muy larga.'
  },
  {
    id: 'bubba-kush',
    name: 'Bubba Kush',
    type: 'Indica',
    floweringTime: { min: 50, max: 60 },
    characteristics: {
      pistilsMaturationRate: 8,
      trichomesDevelopmentRate: 8,
      leafColorChangeRate: 7
    },
    description: 'Indica terrosa con notas de chocolate. Floración rápida.'
  },
  {
    id: 'jack-herer',
    name: 'Jack Herer',
    type: 'Híbrido',
    floweringTime: { min: 60, max: 70 },
    characteristics: {
      pistilsMaturationRate: 6,
      trichomesDevelopmentRate: 7,
      leafColorChangeRate: 5
    },
    description: 'Híbrido sativa-dominante con aroma a pino y especias. Floración media.'
  },
  {
    id: 'girl-scout-cookies',
    name: 'Girl Scout Cookies',
    type: 'Híbrido',
    floweringTime: { min: 60, max: 75 },
    characteristics: {
      pistilsMaturationRate: 7,
      trichomesDevelopmentRate: 8,
      leafColorChangeRate: 6
    },
    description: 'Híbrido potente con sabor dulce y terroso. Floración media.'
  },
  {
    id: 'gorilla-glue',
    name: 'Gorilla Glue',
    type: 'Híbrido',
    floweringTime: { min: 55, max: 65 },
    characteristics: {
      pistilsMaturationRate: 7,
      trichomesDevelopmentRate: 9,
      leafColorChangeRate: 6
    },
    description: 'Híbrido resinoso con aroma a pino y diésel. Floración media.'
  }
];

// Tipos para las preferencias de usuario
export type HarvestPreference = 'Energético' | 'Equilibrado' | 'Relajante';

export interface UserPreferences {
  harvestPreference: HarvestPreference;
  preferredVarieties: string[]; // IDs de las variedades favoritas
  useMicroscopicAnalysis: boolean;
}

// Configuración predeterminada de preferencias
export const DEFAULT_PREFERENCES: UserPreferences = {
  harvestPreference: 'Equilibrado',
  preferredVarieties: [],
  useMicroscopicAnalysis: false
};

// Función para calcular días estimados hasta la cosecha
export function calculateDaysToHarvest(
  ripenessLevel: 'Temprano' | 'Medio' | 'Tardío',
  variety: CannabisVariety,
  preference: HarvestPreference
): number {
  // Factores de ajuste basados en la preferencia del usuario
  const preferenceFactors = {
    'Energético': 0.8, // Cosecha más temprana
    'Equilibrado': 1.0, // Tiempo estándar
    'Relajante': 1.2 // Cosecha más tardía
  };

  // Días base según el nivel de madurez actual
  const baseDays = {
    'Temprano': variety.floweringTime.max * 0.4, // Aproximadamente 40% del tiempo total
    'Medio': variety.floweringTime.max * 0.2, // Aproximadamente 20% del tiempo total
    'Tardío': variety.floweringTime.max * 0.05 // Casi listo
  };

  // Calcular días ajustados según preferencia
  const adjustedDays = baseDays[ripenessLevel] * preferenceFactors[preference];

  // Redondear al entero más cercano
  return Math.round(adjustedDays);
}

// Función para obtener recomendaciones basadas en preferencias
export function getCustomizedRecommendation(
  ripenessLevel: 'Temprano' | 'Medio' | 'Tardío',
  variety: CannabisVariety,
  preference: HarvestPreference
): string {
  const daysToHarvest = calculateDaysToHarvest(ripenessLevel, variety, preference);

  // Recomendaciones detalladas según preferencia, nivel de madurez y variedad
  if (preference === 'Energético') {
    if (ripenessLevel === 'Temprano') {
      return `Tu ${variety.name} (${variety.type}) está en etapa temprana de floración. Para obtener efectos energéticos y cerebrales, necesitarás esperar aproximadamente ${daysToHarvest} días más. Busca que la mayoría de los tricomas se vuelvan lechosos (blancos/opacos), con muy pocos o ningún tricoma ámbar. Continúa monitoreando el desarrollo de los pistilos, que deberían empezar a cambiar de color blanco a naranja/marrón en las próximas semanas.`;
    } else if (ripenessLevel === 'Medio') {
      return `Tu ${variety.name} (${variety.type}) está en un buen momento para preparar la cosecha si buscas efectos energéticos. Para maximizar estos efectos, considera cosechar en los próximos ${daysToHarvest} días cuando aproximadamente el 70-80% de los tricomas estén lechosos y menos del 10% sean ámbar. Observa los pistilos: idealmente, alrededor del 50-60% deberían haber cambiado a color naranja/marrón. Recuerda que cosechar demasiado tarde reducirá los efectos energéticos que buscas.`;
    } else {
      return `¡Atención! Tu ${variety.name} (${variety.type}) está en etapa tardía de floración. Para maximizar los efectos energéticos, deberías cosechar lo antes posible, idealmente en los próximos ${daysToHarvest} días. La planta está desarrollando más efectos sedantes cada día que pasa a medida que los tricomas se vuelven ámbar. Si buscas efectos cerebrales y estimulantes, no demores la cosecha. Verifica que no haya signos de degradación en los cogollos antes de cosechar.`;
    }
  } else if (preference === 'Relajante') {
    if (ripenessLevel === 'Temprano') {
      return `Tu ${variety.name} (${variety.type}) aún está en etapa temprana para obtener efectos relajantes óptimos. Deberás esperar aproximadamente ${daysToHarvest} días más para desarrollar el perfil sedante que buscas. Para efectos relajantes profundos, necesitarás que al menos 20-30% de los tricomas se vuelvan ámbar. Continúa monitoreando el desarrollo de los cogollos, que deberían aumentar significativamente de tamaño y densidad en las próximas semanas.`;
    } else if (ripenessLevel === 'Medio') {
      return `Tu ${variety.name} (${variety.type}) está progresando bien, pero aún faltan aproximadamente ${daysToHarvest} días para alcanzar el nivel óptimo de efectos relajantes. Para maximizar estos efectos, espera a que al menos 20-30% de los tricomas se vuelvan ámbar. Observa también los pistilos: idealmente, alrededor del 70-80% deberían haber cambiado a color naranja/marrón antes de la cosecha. La paciencia en esta etapa será recompensada con efectos más sedantes y relajantes.`;
    } else {
      return `¡Excelente momento para tu ${variety.name} (${variety.type})! La planta está en el punto ideal para cosechar si buscas efectos relajantes profundos. Los tricomas deberían mostrar un buen porcentaje de color ámbar (20-30%), y la mayoría de los pistilos deberían estar oscurecidos. Para efectos aún más sedantes y corporales, podrías esperar ${daysToHarvest} días más, pero vigila que no haya signos de degradación o problemas de moho, especialmente si la humedad ambiental es alta.`;
    }
  } else { // Equilibrado
    if (ripenessLevel === 'Temprano') {
      return `Tu ${variety.name} (${variety.type}) necesita más tiempo para desarrollar un perfil de efectos equilibrados. Espera aproximadamente ${daysToHarvest} días más para alcanzar el balance ideal entre efectos cerebrales y corporales. Busca desarrollar una mezcla de tricomas lechosos (mayoritarios) con algunos ámbar (10-15%). Continúa monitoreando el desarrollo de los cogollos y la maduración de los tricomas semanalmente.`;
    } else if (ripenessLevel === 'Medio') {
      return `Tu ${variety.name} (${variety.type}) está acercándose al punto óptimo para efectos equilibrados. Considera cosechar en aproximadamente ${daysToHarvest} días cuando veas una proporción de aproximadamente 10-15% de tricomas ámbar, con el resto mayoritariamente lechosos. Este balance proporcionará tanto efectos mentales como corporales. Observa también los pistilos: idealmente, alrededor del 60-70% deberían haber cambiado a color naranja/marrón antes de la cosecha.`;
    } else {
      return `¡Tu ${variety.name} (${variety.type}) está en el momento perfecto para cosechar si buscas efectos equilibrados! Los tricomas deberían mostrar una mezcla ideal de lechosos y ámbar (10-20%). No esperes más de ${daysToHarvest} días para evitar que los efectos se vuelvan demasiado sedantes. Este es el punto óptimo para obtener un balance entre los efectos cerebrales y corporales que caracteriza a un perfil equilibrado.`;
    }
  }
}
