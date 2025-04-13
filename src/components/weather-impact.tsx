'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CannabisVariety } from '@/types/cannabis';
import { GeoLocation, ImpactLevel, WeatherData, WeatherImpact } from '@/types/weather';
import { WeatherFallback } from './weather-fallback';
import { WeatherChart } from './weather-chart';
import { WeatherIcon } from './weather-icon';

interface WeatherImpactProps {
  variety?: CannabisVariety;
  ripenessLevel?: 'Temprano' | 'Medio' | 'Tardío';
  weatherData?: WeatherData;
  weatherImpact?: WeatherImpact | { error: boolean; message: string };
  onRequestLocation: () => void;
  isLoading: boolean;
}

export function WeatherImpact({
  variety,
  ripenessLevel,
  weatherData,
  weatherImpact,
  onRequestLocation,
  isLoading
}: WeatherImpactProps) {
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si el navegador soporta geolocalización
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setHasGeolocationPermission(result.state === 'granted');
      });
    } else {
      setHasGeolocationPermission(false);
    }
  }, []);

  // Función para obtener el color según el nivel de impacto
  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case ImpactLevel.POSITIVE:
        return 'text-green-500';
      case ImpactLevel.NEUTRAL:
        return 'text-yellow-500';
      case ImpactLevel.NEGATIVE:
        return 'text-orange-500';
      case ImpactLevel.CRITICAL:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Función para obtener el icono según el nivel de impacto
  const getImpactIcon = (impact: ImpactLevel) => {
    switch (impact) {
      case ImpactLevel.POSITIVE:
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>;
      case ImpactLevel.NEUTRAL:
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
      case ImpactLevel.NEGATIVE:
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
      case ImpactLevel.CRITICAL:
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Impacto Climático en la Cosecha</CardTitle>
        <CardDescription>
          Análisis de condiciones climáticas actuales y su efecto en el momento óptimo de cosecha
          {variety && ` para ${variety.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Si hay un error en el impacto climático, mostrar el mensaje de error */}
        {weatherImpact && 'error' in weatherImpact && weatherImpact.error && (
          <WeatherFallback
            onRequestLocation={onRequestLocation}
            isLoading={isLoading}
            error={weatherImpact.message}
          />
        )}

        {/* Si no hay datos climáticos, mostrar el fallback */}
        {!weatherData && (
          <WeatherFallback
            onRequestLocation={onRequestLocation}
            isLoading={isLoading}
            error={hasGeolocationPermission === false ?
              'Tu navegador no soporta geolocalización o has bloqueado el permiso. Activa la geolocalización en la configuración de tu navegador para usar esta función.' :
              undefined
            }
          />
        )}

        {/* Si hay datos climáticos y no hay error, mostrar el análisis */}
        {weatherData && weatherImpact && !('error' in weatherImpact) && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
            </TabsList>

            {/* Pestaña de resumen */}
            <TabsContent value="overview" className="space-y-4 pt-4">
            {/* Datos climáticos actuales */}
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Condiciones Actuales</h3>
              <div className="flex items-center mb-4">
                <WeatherIcon condition={weatherData.current.condition} size="lg" className="mr-4" />
                <div>
                  <div className="text-xl font-bold">{weatherData.current.condition}</div>
                  <div className="text-sm text-muted-foreground">
                    Ubicación: {weatherData.location.name || `${weatherData.location.latitude.toFixed(2)}, ${weatherData.location.longitude.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Temperatura</span>
                  <span className="text-xl font-bold">{weatherData.current.temperature}°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Humedad</span>
                  <span className="text-xl font-bold">{weatherData.current.humidity}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Índice UV</span>
                  <span className="text-xl font-bold">{weatherData.current.uv_index}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Viento</span>
                  <span className="text-xl font-bold">{weatherData.current.wind_speed} km/h</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-right">
                Fuente: {weatherData.source} | Actualizado: {new Date(weatherData.current.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Análisis de impacto */}
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Análisis de Impacto</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Impacto de temperatura:</span>
                  <span className={`font-medium ${getImpactColor(weatherImpact.temperature_impact)}`}>
                    {weatherImpact.temperature_impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Impacto de humedad:</span>
                  <span className={`font-medium ${getImpactColor(weatherImpact.humidity_impact)}`}>
                    {weatherImpact.humidity_impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Impacto UV:</span>
                  <span className={`font-medium ${getImpactColor(weatherImpact.uv_impact)}`}>
                    {weatherImpact.uv_impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Impacto general:</span>
                  <span className={`font-bold ${getImpactColor(weatherImpact.overall_impact)}`}>
                    {weatherImpact.overall_impact.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Ajuste de tiempo de cosecha */}
            {weatherImpact.harvest_adjustment_days !== undefined && (
              <div className={`rounded-lg p-4 shadow-sm ${
                weatherImpact.harvest_adjustment_days === -999 ?
                'bg-red-200 dark:bg-red-900/40 border border-red-500' :
                weatherImpact.harvest_adjustment_days < 0 ?
                'bg-orange-200 dark:bg-orange-900/40 border border-orange-500' :
                'bg-green-200 dark:bg-green-900/40 border border-green-500'
              }`}>
                <div className="flex items-start gap-2">
                  {getImpactIcon(
                    weatherImpact.harvest_adjustment_days === -999 ?
                    ImpactLevel.CRITICAL :
                    weatherImpact.harvest_adjustment_days < 0 ?
                    ImpactLevel.NEGATIVE :
                    ImpactLevel.POSITIVE
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {weatherImpact.harvest_adjustment_days === -999
                        ? 'Cosecha Inmediata Recomendada'
                        : weatherImpact.harvest_adjustment_days < 0
                          ? `Adelantar cosecha ${Math.abs(weatherImpact.harvest_adjustment_days)} días`
                          : weatherImpact.harvest_adjustment_days > 0
                            ? `Retrasar cosecha ${weatherImpact.harvest_adjustment_days} días`
                            : 'No se requiere ajuste de cosecha'}
                    </h3>
                    <p className="text-sm mt-1 font-medium text-foreground">
                      {weatherImpact.harvest_adjustment_days === -999
                        ? 'Las condiciones climáticas son críticas. Se recomienda cosechar inmediatamente para evitar daños.'
                        : weatherImpact.harvest_adjustment_days < 0
                          ? 'Las condiciones climáticas previstas podrían afectar negativamente a la planta. Se recomienda adelantar la cosecha.'
                          : 'Las condiciones climáticas son favorables para el desarrollo óptimo de la planta.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Recomendaciones</h3>
              <ul className="space-y-2">
                {weatherImpact.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-1 flex-shrink-0"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pronóstico */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">Pronóstico</h3>
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 pb-2">
                    {weatherData.forecast.slice(0, 5).map((day, index) => (
                      <div key={index} className="flex flex-col items-center min-w-[80px]">
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-medium mt-1">
                          {day.temperature_max.toFixed(1)}° / {day.temperature_min.toFixed(1)}°
                        </span>
                        <span className="text-xs mt-1">
                          {day.humidity}% HR
                        </span>
                        {day.precipitation_probability > 30 && (
                          <span className="text-xs text-blue-500 mt-1">
                            {day.precipitation_probability}% lluvia
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </TabsContent>

            {/* Pestaña de pronóstico */}
            <TabsContent value="forecast" className="space-y-4 pt-4">
              {weatherData.forecast && weatherData.forecast.length > 0 && (
                <>
                  {/* Gráfico de pronóstico */}
                  <WeatherChart
                    forecast={weatherData.forecast}
                    title="Evolución de Temperatura y Humedad"
                    description="Pronóstico para los próximos 7 días"
                  />

                  {/* Detalles del pronóstico */}
                  <div className="rounded-lg bg-card p-4 shadow-sm mt-4">
                    <h3 className="text-lg font-medium mb-2">Detalles del Pronóstico</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {weatherData.forecast.slice(0, 8).map((day, index) => (
                        <div key={index} className="p-3 rounded-md bg-muted">
                          <div className="font-medium text-center border-b pb-1 mb-2">
                            {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex justify-center mb-2">
                            <WeatherIcon condition={day.condition} size="md" />
                          </div>
                          <div className="text-center mb-2 text-sm font-medium">
                            {day.condition}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Máx:</span>
                              <span className="font-medium">{day.temperature_max.toFixed(1)}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mín:</span>
                              <span className="font-medium">{day.temperature_min.toFixed(1)}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Humedad:</span>
                              <span className="font-medium">{day.humidity}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>UV:</span>
                              <span className="font-medium">{day.uv_index}</span>
                            </div>
                            {day.precipitation_probability > 0 && (
                              <div className="flex justify-between text-blue-500">
                                <span>Lluvia:</span>
                                <span className="font-medium">{day.precipitation_probability}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Pestaña de recomendaciones */}
            <TabsContent value="recommendations" className="space-y-4 pt-4">
              {/* Recomendaciones */}
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">Recomendaciones Detalladas</h3>
                <ul className="space-y-3">
                  {weatherImpact.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>

                {/* Consejos generales basados en el impacto */}
                <div className="mt-6 p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-2">Consejos generales basados en el análisis</h4>
                  <ul className="space-y-2 text-sm">
                    {weatherImpact.temperature_impact !== ImpactLevel.POSITIVE && (
                      <li className="flex items-start gap-2">
                        <span className="font-medium">Temperatura:</span>
                        <span>
                          {weatherImpact.temperature_impact === ImpactLevel.CRITICAL ?
                            'Las condiciones de temperatura son críticas. Toma medidas inmediatas para proteger tus plantas.' :
                            weatherImpact.temperature_impact === ImpactLevel.NEGATIVE ?
                            'La temperatura actual no es óptima. Considera ajustar las condiciones ambientales.' :
                            'La temperatura está ligeramente fuera del rango óptimo. Monitorea regularmente.'
                          }
                        </span>
                      </li>
                    )}

                    {weatherImpact.humidity_impact !== ImpactLevel.POSITIVE && (
                      <li className="flex items-start gap-2">
                        <span className="font-medium">Humedad:</span>
                        <span>
                          {weatherImpact.humidity_impact === ImpactLevel.CRITICAL ?
                            'La humedad actual es peligrosa para tus plantas. Riesgo alto de moho o estrés hídrico.' :
                            weatherImpact.humidity_impact === ImpactLevel.NEGATIVE ?
                            'La humedad no es óptima. Mejora la ventilación o considera usar un humidificador/deshumidificador.' :
                            'La humedad está ligeramente fuera del rango ideal. Monitorea para prevenir problemas.'
                          }
                        </span>
                      </li>
                    )}

                    {weatherImpact.uv_impact !== ImpactLevel.POSITIVE && (
                      <li className="flex items-start gap-2">
                        <span className="font-medium">Radiación UV:</span>
                        <span>
                          {weatherImpact.uv_impact === ImpactLevel.CRITICAL ?
                            'El nivel de radiación UV es extremo. Proporciona sombra o protección adicional.' :
                            weatherImpact.uv_impact === ImpactLevel.NEGATIVE ?
                            'La radiación UV no es óptima. Ajusta la exposición a la luz.' :
                            'El nivel UV está ligeramente fuera del rango ideal. Monitorea el desarrollo de la planta.'
                          }
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
