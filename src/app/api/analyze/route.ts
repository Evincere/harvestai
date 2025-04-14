import { analyzeCannabisImage } from '@/ai/flows/analyze-cannabis-image';
import { CannabisVariety, UserPreferences } from '@/types/cannabis';
import { GeoLocation, WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/weather/weather-service';
import { WeatherImpactService } from '@/services/weather/weather-impact-service';
import weatherConfig from '@/config/weather-config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      photoUrl,
      microscopicPhotoUrl,
      description,
      variety,
      preferences,
      location
    } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Se requiere una imagen' },
        { status: 400 }
      );
    }

    // Inicializar servicios de clima
    const weatherService = new WeatherService(weatherConfig);
    const weatherImpactService = new WeatherImpactService();

    // Variables para almacenar datos climáticos y su impacto
    let weatherData: WeatherData | null = null;
    let weatherImpact: any = null;

    // Si se proporcionó una ubicación, obtener datos climáticos
    if (location && location.latitude && location.longitude) {
      try {
        // Obtener datos climáticos
        weatherData = await weatherService.getBestWeatherData(location as GeoLocation);

        // Si hay datos climáticos y una variedad seleccionada, analizar el impacto
        if (weatherData && variety) {
          // Determinar el nivel de madurez (si aún no se ha analizado la imagen)
          const ripenessLevel = 'Medio'; // Valor predeterminado hasta que se analice la imagen

          // Analizar el impacto climático
          weatherImpact = weatherImpactService.analyzeWeatherImpact(
            weatherData,
            variety as CannabisVariety,
            ripenessLevel,
            preferences as UserPreferences
          );
        }
      } catch (weatherError: any) {
        console.error('Error al obtener datos climáticos:', weatherError);
        // Continuar con el análisis de la imagen aunque falle la obtención de datos climáticos
        // Guardar el mensaje de error para mostrarlo en la interfaz
        weatherData = null;
        weatherImpact = {
          error: true,
          message: weatherError.message || 'No se pudieron obtener datos climáticos. Verifica tu conexión a internet.'
        };
      }
    }

    // Analizar la imagen
    const imageAnalysisResult = await analyzeCannabisImage({
      photoUrl,
      microscopicPhotoUrl,
      description,
      variety: variety as CannabisVariety,
      preferences: preferences as UserPreferences,
      weatherData // Pasar los datos climáticos al análisis de la imagen
    });

    // Si se obtuvo un análisis de imagen exitoso y hay datos climáticos,
    // actualizar el análisis de impacto climático con el nivel de madurez correcto
    if (imageAnalysisResult && weatherData && variety) {
      weatherImpact = weatherImpactService.analyzeWeatherImpact(
        weatherData,
        variety as CannabisVariety,
        imageAnalysisResult.ripenessLevel,
        preferences as UserPreferences
      );
    }

    // Combinar los resultados
    const result = {
      ...imageAnalysisResult,
      weatherData,
      weatherImpact
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en el análisis:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
