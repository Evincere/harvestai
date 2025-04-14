'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeoLocation } from '@/types/weather';
import { Loader2, MapPin, Navigation, Search } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelected: (location: GeoLocation) => void;
  onRequestAutoLocation: () => void;
  isLoading: boolean;
}

export function LocationSelector({
  onLocationSelected,
  onRequestAutoLocation,
  isLoading
}: LocationSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>('auto');
  const [cityName, setCityName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<{latitude: string, longitude: string}>({
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Función para buscar una ciudad
  const searchCity = async () => {
    if (!cityName.trim()) {
      setError('Por favor, ingresa el nombre de una ciudad');
      return;
    }

    setError(null);
    setSearchLoading(true);
    console.log('Buscando ciudad:', cityName);

    try {
      // Usar la API de OpenStreetMap para geocodificación
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=5&addressdetails=1`;
      console.log('URL de búsqueda:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HarvestAI/1.0' // Es buena práctica identificar tu aplicación
        }
      });

      if (!response.ok) {
        throw new Error(`Error al buscar la ubicación: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resultados de búsqueda:', data);

      if (data.length === 0) {
        setError('No se encontraron resultados para esta búsqueda');
        setSearchResults([]);
      } else {
        // Asegurarse de que los resultados tienen la estructura esperada
        const validResults = data.filter(item =>
          item && typeof item === 'object' && item.lat && item.lon && item.display_name
        );

        if (validResults.length === 0) {
          setError('Los resultados recibidos no tienen el formato esperado');
          console.error('Resultados con formato incorrecto:', data);
        }

        setSearchResults(validResults);
      }
    } catch (error) {
      console.error('Error al buscar la ciudad:', error);
      setError('Error al buscar la ubicación. Intenta de nuevo más tarde.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para seleccionar una ubicación de los resultados
  const selectLocation = (result: any) => {
    console.log('Seleccionando ubicación:', result);

    try {
      if (!result || !result.lat || !result.lon) {
        throw new Error('Datos de ubicación incompletos');
      }

      const location: GeoLocation = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        name: result.display_name.split(',')[0],
        country: result.address?.country || result.display_name.split(',').pop()?.trim()
      };

      console.log('Ubicación procesada:', location);

      // Limpiar resultados y errores
      setSearchResults([]);
      setError(null);
      setCityName('');

      // Llamar a la función del componente padre
      onLocationSelected(location);
    } catch (error) {
      console.error('Error al procesar la ubicación seleccionada:', error);
      setError('Error al procesar la ubicación seleccionada. Intenta con otra.');
    }
  };

  // Función para usar coordenadas manuales
  const useCoordinates = () => {
    console.log('Usando coordenadas manuales:', coordinates);

    try {
      const lat = parseFloat(coordinates.latitude);
      const lon = parseFloat(coordinates.longitude);

      if (isNaN(lat) || isNaN(lon)) {
        setError('Por favor, ingresa coordenadas válidas');
        return;
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setError('Coordenadas fuera de rango. Latitud: -90 a 90, Longitud: -180 a 180');
        return;
      }

      setError(null);

      const location: GeoLocation = {
        latitude: lat,
        longitude: lon
      };

      console.log('Ubicación por coordenadas:', location);

      // Limpiar campos
      setCoordinates({
        latitude: '',
        longitude: ''
      });

      // Llamar a la función del componente padre
      onLocationSelected(location);
    } catch (error) {
      console.error('Error al procesar coordenadas:', error);
      setError('Error al procesar las coordenadas. Verifica el formato.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Seleccionar Ubicación</CardTitle>
        <CardDescription>
          Elige cómo quieres proporcionar tu ubicación para obtener datos climáticos precisos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auto" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto">Automática</TabsTrigger>
            <TabsTrigger value="search">Buscar Ciudad</TabsTrigger>
            <TabsTrigger value="coordinates">Coordenadas</TabsTrigger>
          </TabsList>

          {/* Ubicación automática */}
          <TabsContent value="auto" className="space-y-4 pt-4">
            <div className="text-center py-6">
              <Navigation className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Usar mi ubicación actual</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permite acceso a tu ubicación para obtener datos climáticos precisos de tu zona actual.
              </p>
              <Button
                onClick={onRequestAutoLocation}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Usar mi ubicación
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Búsqueda por ciudad */}
          <TabsContent value="search" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="city">Nombre de la ciudad</Label>
                <div className="flex space-x-2">
                  <Input
                    id="city"
                    placeholder="Ej: Buenos Aires, Madrid, Bogotá..."
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchCity()}
                  />
                  <Button
                    onClick={searchCity}
                    disabled={searchLoading || !cityName.trim()}
                  >
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 font-medium">
                  {error}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Resultados de la búsqueda</Label>
                  <div className="border rounded-md divide-y">
                    {searchResults.map((result, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="p-3 w-full justify-start h-auto hover:bg-muted cursor-pointer flex items-start space-x-2"
                        onClick={() => selectLocation(result)}
                      >
                        <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">{result.display_name.split(',')[0]}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[250px]">{result.display_name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Coordenadas manuales */}
          <TabsContent value="coordinates" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    placeholder="-34.6037"
                    value={coordinates.latitude}
                    onChange={(e) => setCoordinates({...coordinates, latitude: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    placeholder="-58.3816"
                    value={coordinates.longitude}
                    onChange={(e) => setCoordinates({...coordinates, longitude: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 font-medium">
                  {error}
                </div>
              )}

              <Button
                onClick={useCoordinates}
                className="w-full"
                disabled={!coordinates.latitude || !coordinates.longitude}
              >
                Usar estas coordenadas
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>Ejemplos:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Buenos Aires: -34.6037, -58.3816</li>
                  <li>Madrid: 40.4168, -3.7038</li>
                  <li>Ciudad de México: 19.4326, -99.1332</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Los datos climáticos se obtienen basados en la ubicación seleccionada</div>
      </CardFooter>
    </Card>
  );
}
