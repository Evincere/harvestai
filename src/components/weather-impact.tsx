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
import { LocationSelector } from './location-selector';
import { MapPin, BarChart2, CloudSun, ListChecks } from 'lucide-react';

interface WeatherImpactProps {
  variety?: CannabisVariety;
  ripenessLevel?: 'Temprano' | 'Medio' | 'Tardío';
  weatherData?: WeatherData;
  weatherImpact?: WeatherImpact | { error: boolean; message: string };
  onRequestLocation: () => void;
  onManualLocationSelected?: (location: GeoLocation) => void;
  isLoading: boolean;
}

export function WeatherImpact({
  variety,
  ripenessLevel,
  weatherData,
  weatherImpact,
  onRequestLocation,
  onManualLocationSelected,
  isLoading
}: WeatherImpactProps) {
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState<boolean | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);

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
        return 'text-green-700 dark:text-green-400 font-bold';
      case ImpactLevel.NEUTRAL:
        return 'text-yellow-700 dark:text-yellow-400 font-bold';
      case ImpactLevel.NEGATIVE:
        return 'text-orange-700 dark:text-orange-400 font-bold';
      case ImpactLevel.CRITICAL:
        return 'text-red-700 dark:text-red-400 font-bold';
      default:
        return 'text-gray-700 dark:text-gray-400 font-bold';
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

  // Funciones para detectar condiciones climáticas específicas
  const highHumidityDays = (impact: WeatherImpact): boolean => {
    return impact.humidity_impact === ImpactLevel.NEGATIVE || impact.humidity_impact === ImpactLevel.CRITICAL;
  };

  const highTempDays = (impact: WeatherImpact): boolean => {
    return impact.temperature_impact === ImpactLevel.NEGATIVE || impact.temperature_impact === ImpactLevel.CRITICAL;
  };

  const lowTempDays = (impact: WeatherImpact): boolean => {
    // Asumimos temperaturas bajas cuando hay un impacto positivo (retraso en la cosecha)
    return impact.harvest_adjustment_days > 0 && impact.temperature_impact !== ImpactLevel.CRITICAL;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Impacto Climático en la Cosecha</CardTitle>
            <CardDescription>
              Análisis de condiciones climáticas actuales y su efecto en el momento óptimo de cosecha
              {variety && ` para ${variety.name}`}
            </CardDescription>
          </div>
          {weatherData && weatherData.location && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary/50 px-3 py-1 rounded-full text-sm">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                <span className="font-medium">
                  {weatherData.location.name || `${weatherData.location.latitude.toFixed(2)}, ${weatherData.location.longitude.toFixed(2)}`}
                  {weatherData.location.country && `, ${weatherData.location.country}`}
                </span>
              </div>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
                title="Cambiar ubicación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Si hay un error en el impacto climático, mostrar el mensaje de error */}
        {weatherImpact && 'error' in weatherImpact && weatherImpact.error && (
          <WeatherFallback
            onRequestLocation={onRequestLocation}
            onManualLocationSelected={onManualLocationSelected}
            isLoading={isLoading}
            currentLocation={weatherData?.location}
            error={weatherImpact.message}
          />
        )}

        {/* Si no hay datos climáticos, mostrar el fallback */}
        {!weatherData && (
          <WeatherFallback
            onRequestLocation={onRequestLocation}
            onManualLocationSelected={onManualLocationSelected}
            isLoading={isLoading}
            currentLocation={weatherData?.location}
            error={hasGeolocationPermission === false ?
              'Tu navegador no soporta geolocalización o has bloqueado el permiso. Activa la geolocalización en la configuración de tu navegador para usar esta función.' :
              undefined
            }
          />
        )}

        {/* Selector de ubicación */}
        {showLocationSelector && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Cambiar ubicación</h3>
              <button
                onClick={() => setShowLocationSelector(false)}
                className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
                title="Cerrar selector de ubicación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <LocationSelector
              onLocationSelected={(location) => {
                if (onManualLocationSelected) {
                  onManualLocationSelected(location);
                  setShowLocationSelector(false);
                }
              }}
              onRequestAutoLocation={() => {
                onRequestLocation();
                setShowLocationSelector(false);
              }}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Si hay datos climáticos y no hay error, mostrar el análisis */}
        {weatherData && weatherImpact && !('error' in weatherImpact) && !showLocationSelector && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <span className="hidden sm:inline">Resumen</span>
                <BarChart2 className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="forecast">
                <span className="hidden sm:inline">Pronóstico</span>
                <CloudSun className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <span className="hidden sm:inline">Recomendaciones</span>
                <ListChecks className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
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
                    {new Date(weatherData.current.timestamp).toLocaleString()}
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

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLocationSelector(true)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Cambiar ubicación
                </Button>
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
                {weatherImpact.hail_impact && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Impacto de granizo:</span>
                    <span className={`font-medium ${getImpactColor(weatherImpact.hail_impact)}`}>
                      {weatherImpact.hail_impact.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Impacto general:</span>
                  <span className={`font-bold ${getImpactColor(weatherImpact.overall_impact)}`}>
                    {weatherImpact.overall_impact.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Alertas meteorológicas */}
            {weatherImpact.alerts && weatherImpact.alerts.length > 0 && (
              <Alert variant="destructive" className="mb-4 border-red-600 bg-red-100 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-600"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <AlertTitle className="text-red-600 font-bold text-lg">¡ALERTA METEOROLÓGICA!</AlertTitle>
                <AlertDescription className="text-red-600">
                  <p className="font-medium mb-2">Se han detectado las siguientes alertas que podrían afectar a tus plantas:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {weatherImpact.alerts.map((alert, index) => (
                      <li key={index} className="font-medium">
                        {alert.type === 'hail' ? '🧊 ALERTA DE GRANIZO: ' : '⚠️ '}
                        {alert.title} - {alert.description.substring(0, 100)}{alert.description.length > 100 ? '...' : ''}
                        <span className="block text-xs mt-1">
                          Desde: {new Date(alert.start).toLocaleString()} hasta: {new Date(alert.end).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-bold">Revisa las recomendaciones para proteger tus plantas.</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Ajuste de tiempo de cosecha */}
            {weatherImpact.harvest_adjustment_days !== undefined && (
              <div className={`rounded-lg p-4 shadow-sm ${
                weatherImpact.harvest_adjustment_days === -999 ?
                'bg-red-200 dark:bg-red-900/40 border border-red-500 text-red-900 dark:text-red-100' :
                weatherImpact.harvest_adjustment_days < 0 ?
                'bg-orange-200 dark:bg-orange-900/40 border border-orange-500 text-orange-900 dark:text-orange-100' :
                'bg-green-200 dark:bg-green-900/40 border border-green-500 text-green-900 dark:text-green-100'
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
                    <h3 className="text-lg font-bold">
                      {weatherImpact.harvest_adjustment_days === -999
                        ? 'Cosecha Inmediata Recomendada'
                        : weatherImpact.harvest_adjustment_days < 0
                          ? `Adelantar cosecha ${Math.abs(weatherImpact.harvest_adjustment_days)} días`
                          : weatherImpact.harvest_adjustment_days > 0
                            ? `Retrasar cosecha ${weatherImpact.harvest_adjustment_days} días`
                            : 'No se requiere ajuste de cosecha'}
                    </h3>
                    <p className="text-sm mt-1 font-medium">
                      {weatherImpact.harvest_adjustment_days === -999
                        ? 'Las condiciones climáticas son críticas. Se recomienda cosechar inmediatamente para evitar daños.'
                        : weatherImpact.harvest_adjustment_days < 0
                          ? weatherImpact.harvest_adjustment_days <= -3
                            ? `Se detectaron ${highHumidityDays(weatherImpact) ? 'altos niveles de humedad' : highTempDays(weatherImpact) ? 'temperaturas elevadas' : 'condiciones adversas'} en el pronóstico. Se recomienda adelantar la cosecha para evitar problemas de moho o deterioro.`
                            : `Las condiciones climáticas previstas podrían afectar negativamente a la planta. Se recomienda adelantar ligeramente la cosecha como medida preventiva.`
                          : weatherImpact.harvest_adjustment_days >= 3
                            ? `Se detectaron ${lowTempDays(weatherImpact) ? 'temperaturas bajas' : 'condiciones que ralentizan la maduración'} en el pronóstico. Un periodo adicional de desarrollo beneficiará la calidad final.`
                            : weatherImpact.harvest_adjustment_days > 0
                              ? 'Las condiciones climáticas favorecen un desarrollo más prolongado. Un tiempo adicional permitirá mayor desarrollo de cannabinoides.'
                              : 'Las condiciones climáticas actuales son óptimas para el desarrollo de la planta. Mantén el plan de cosecha original.'}
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
                        {day.hail_probability && day.hail_probability > 0 && (
                          <span className="text-xs text-red-500 font-bold mt-1">
                            {day.hail_probability}% granizo
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
                            {day.hail_probability && day.hail_probability > 0 && (
                              <div className="flex justify-between text-red-500">
                                <span>Granizo:</span>
                                <span className="font-medium">{day.hail_probability}%</span>
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

                    {weatherImpact.hail_impact && (
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-red-600">Alerta de granizo:</span>
                        <span className="text-red-600">
                          {weatherImpact.hail_impact === ImpactLevel.CRITICAL ?
                            '¡PELIGRO! Hay una alta probabilidad de granizo severo. Toma medidas inmediatas para proteger tus plantas o considera cosechar si están cerca del punto óptimo.' :
                            weatherImpact.hail_impact === ImpactLevel.NEGATIVE ?
                            'Hay riesgo de granizo en los próximos días. Prepara protecciones como lonas, mallas antigranizo o coberturas temporales.' :
                            'Existe una baja probabilidad de granizo. Mantén preparadas protecciones por si acaso.'
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
