// Tipos para datos climáticos
export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  forecast?: ForecastWeather[];
  source: string; // Nombre de la API que proporcionó los datos
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string; // Nombre de la ubicación (ciudad, etc.)
  country?: string;
  region?: string;
}

export interface CurrentWeather {
  temperature: number; // Temperatura en °C
  humidity: number; // Humedad relativa en %
  uv_index: number; // Índice UV
  wind_speed: number; // Velocidad del viento en km/h
  precipitation: number; // Precipitación en mm
  condition: string; // Descripción del clima (soleado, nublado, etc.)
  timestamp: string; // Fecha y hora de la medición
}

export interface ForecastWeather {
  date: string; // Fecha del pronóstico
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  uv_index: number;
  precipitation_probability: number;
  condition: string;
}

// Interfaz para el impacto del clima en el cultivo de cannabis
export interface WeatherImpact {
  temperature_impact: ImpactLevel;
  humidity_impact: ImpactLevel;
  uv_impact: ImpactLevel;
  overall_impact: ImpactLevel;
  recommendations: string[];
  harvest_adjustment_days?: number; // Ajuste recomendado en días (positivo = retrasar, negativo = adelantar)
}

export enum ImpactLevel {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  CRITICAL = 'critical'
}

// Configuración para las APIs de clima
export interface WeatherApiConfig {
  openWeatherMap?: {
    apiKey: string;
    baseUrl: string;
  };
  visualCrossing?: {
    apiKey: string;
    baseUrl: string;
  };
  weatherApi?: {
    apiKey: string;
    baseUrl: string;
  };
  aerisWeather?: {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
  };
}

// Parámetros óptimos para el cultivo de cannabis según la etapa
export const OPTIMAL_CANNABIS_CONDITIONS = {
  EARLY_FLOWERING: {
    temperature_min: 20,
    temperature_max: 28,
    humidity_min: 40,
    humidity_max: 60,
    uv_index_min: 3,
    uv_index_max: 6
  },
  MID_FLOWERING: {
    temperature_min: 18,
    temperature_max: 26,
    humidity_min: 40,
    humidity_max: 55,
    uv_index_min: 3,
    uv_index_max: 6
  },
  LATE_FLOWERING: {
    temperature_min: 18,
    temperature_max: 24,
    humidity_min: 35,
    humidity_max: 50,
    uv_index_min: 2,
    uv_index_max: 5
  }
};
