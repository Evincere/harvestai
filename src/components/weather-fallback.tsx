'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LocationSelector } from "./location-selector";
import { GeoLocation } from "@/types/weather";

interface WeatherFallbackProps {
  onRequestLocation: () => void;
  onManualLocationSelected?: (location: GeoLocation) => void;
  isLoading: boolean;
  error?: string;
  currentLocation?: GeoLocation;
}

export function WeatherFallback({
  onRequestLocation,
  onManualLocationSelected,
  isLoading,
  error,
  currentLocation
}: WeatherFallbackProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Datos Climáticos</CardTitle>
            <CardDescription>
              Obtén recomendaciones más precisas basadas en el clima actual
            </CardDescription>
          </div>
          {currentLocation && (
            <div className="flex items-center bg-secondary/50 px-3 py-1 rounded-full text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1 text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span className="font-medium">
                {currentLocation.name || `${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`}
                {currentLocation.country && `, ${currentLocation.country}`}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <AlertTitle>Error al obtener datos climáticos</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
              <div className="mt-2 text-sm">
                <p>No se pueden mostrar datos climáticos reales debido al error. Por favor, intenta de nuevo más tarde o verifica la configuración de las APIs de clima.</p>
              </div>
            </Alert>
          ) : onManualLocationSelected ? (
            <LocationSelector
              onLocationSelected={onManualLocationSelected}
              onRequestAutoLocation={onRequestLocation}
              isLoading={isLoading}
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Para obtener recomendaciones precisas basadas en el clima actual, necesitamos acceder a tu ubicación.
              </p>
              <Button
                onClick={onRequestLocation}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 animate-spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Usar mi ubicación
                  </>
                )}
              </Button>
            </>
          )}

          <div className="mt-4 p-3 bg-muted rounded-md">
            <h3 className="text-sm font-medium mb-1">¿Por qué es importante el clima?</h3>
            <p className="text-xs text-muted-foreground">
              Las condiciones climáticas como temperatura, humedad y radiación UV afectan directamente la maduración del cannabis.
              Con datos climáticos precisos, podemos ofrecerte recomendaciones más exactas sobre el momento óptimo de cosecha.
            </p>
          </div>

          {/* Botón para volver a la pestaña general */}
          <div className="mt-4 flex justify-start">
            <Button
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'general' }))}
              size="sm"
              className="text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Volver a General
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
