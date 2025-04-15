'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { AnalyzeCannabisImageOutput } from '@/ai/flows/analyze-cannabis-image';
import { CannabisPreferences } from '@/components/cannabis-preferences';
import { QuickPreferences } from '@/components/quick-preferences';
import { AnalysisWizard } from '@/components/analysis-wizard';
import { ClimateConditions } from '@/components/climate-conditions';
import { WeatherImpact } from '@/components/weather-impact';
import { WeatherFallback } from '@/components/weather-fallback';
import { WeatherPreferences } from '@/components/weather-preferences';
import { ApiKeyWarning } from '@/components/api-key-warning';
import { CameraCapture } from '@/components/camera-capture';
import { CANNABIS_VARIETIES, CannabisVariety, DEFAULT_PREFERENCES, UserPreferences, getCustomizedRecommendation } from '@/types/cannabis';
import { GeoLocation, WeatherData, WeatherImpact as WeatherImpactType } from '@/types/weather';
import { ExifService } from '@/services/geo/exif-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Settings, Search, Cloud, MapPin, ArrowRight, Wand2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from '@/components/icons';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];



const RIPENESS_CRITERIA = {
  Temprano: {
    recommendedAction: "Es recomendable esperar un poco más. La planta aún está en etapa de crecimiento."
  },
  Medio: {
    recommendedAction: "La planta está en una etapa óptima de madurez. Podría ser cosechada en breve."
  },
  Tardío: {
    recommendedAction: "La planta está muy madura. Se recomienda cosecharla lo antes posible."
  }
};

export default function HomePage() {
  // Estados básicos
  const [image, setImage] = useState<string | null>(null);
  const [microscopicImage, setMicroscopicImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCannabisImageOutput | null>(null);
  const [plantDescription, setPlantDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Estados para las nuevas funcionalidades
  const [activeTab, setActiveTab] = useState<string>('general');
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [selectedVariety, setSelectedVariety] = useState<CannabisVariety | undefined>(undefined);
  const [useWizard, setUseWizard] = useState<boolean>(false);

  // Estados para funcionalidades de clima
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData | undefined>(undefined);
  const [weatherImpact, setWeatherImpact] = useState<WeatherImpactType | undefined>(undefined);
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState<boolean | null>(null);

  // Estados para la captura de imágenes con cámara
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [microscopicCameraOpen, setMicroscopicCameraOpen] = useState<boolean>(false);

  // Función para manejar la ubicación seleccionada (automática o manual)
  const handleLocationSelected = (location: GeoLocation) => {
    setUserLocation(location);

    // Ya no cambiamos automáticamente a la pestaña de clima
    // Solo mostramos un mensaje informativo

    // Mostrar mensaje de éxito
    toast({
      title: 'Ubicación configurada',
      description: location.name
        ? `Se usará ${location.name} para el análisis climático.`
        : 'Se ha configurado la ubicación para mejorar el análisis.'
    });

    setLoadingWeather(false);
  };

  // Función para solicitar la ubicación del usuario
  const requestLocation = useCallback(() => {
    setLoadingWeather(true);

    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocalización no disponible',
        description: 'Tu navegador no soporta geolocalización.'
      });
      setLoadingWeather(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        handleLocationSelected(location);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        toast({
          variant: 'destructive',
          title: 'Error de geolocalización',
          description: 'No se pudo obtener tu ubicación. ' + error.message
        });
        setLoadingWeather(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [toast, setLoadingWeather]);

  // Verificar si el navegador soporta geolocalización
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(result => {
        setHasGeolocationPermission(result.state === 'granted');

        // Ya no solicitamos la ubicación automáticamente al cargar la página
        // para evitar cambios inesperados en la navegación
      });
    } else {
      setHasGeolocationPermission(false);
    }

    // Manejador para el evento personalizado de navegación entre pestañas
    const handleTabNavigation = (event: CustomEvent) => {
      const tabName = event.detail;
      if (tabName && typeof tabName === 'string') {
        setActiveTab(tabName);
      }
    };

    // Registrar el manejador de eventos
    window.addEventListener('navigate-to-tab', handleTabNavigation as EventListener);

    // Limpiar el manejador al desmontar el componente
    return () => {
      window.removeEventListener('navigate-to-tab', handleTabNavigation as EventListener);
    };
  }, []);

  // Actualizar la variedad seleccionada cuando cambian las preferencias
  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);

    // Actualizar la variedad seleccionada si se ha elegido una
    if (newPreferences.preferredVarieties.length > 0) {
      const varietyId = newPreferences.preferredVarieties[0];
      const variety = CANNABIS_VARIETIES.find(v => v.id === varietyId);
      setSelectedVariety(variety);
    } else {
      setSelectedVariety(undefined);
    }
  };

  // Función para manejar la carga de imágenes desde archivo
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isMicroscopic: boolean = false) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validaciones básicas
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Formato no soportado',
        description: 'Por favor usa imágenes en formato JPG, PNG o WebP.'
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Archivo muy grande',
        description: 'La imagen debe ser menor a 5MB.'
      });
      return;
    }

    try {
      // Procesar imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        processImageData(reader.result as string, isMicroscopic);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al procesar imagen',
        description: 'No se pudo procesar la imagen. Intenta con otra.'
      });
    }
  };

  // Función para manejar la captura de imágenes desde la cámara
  const handleCameraCapture = (imageDataUrl: string, isMicroscopic: boolean = false) => {
    processImageData(imageDataUrl, isMicroscopic);
  };

  // Función para procesar los datos de la imagen (común para archivo y cámara)
  const processImageData = (imageDataUrl: string, isMicroscopic: boolean = false) => {
    const img = new Image();
    img.onload = () => {
      // Validar dimensiones mínimas (menos estrictas para imágenes microscópicas)
      const minWidth = isMicroscopic ? 200 : 300;
      const minHeight = isMicroscopic ? 200 : 300;

      // Intentar extraer datos de geolocalización de la imagen (solo para imágenes normales)
      if (!isMicroscopic && !userLocation) {
        const exifService = new ExifService();
        exifService.extractGeoLocation(imageDataUrl)
          .then(location => {
            if (location) {
              setUserLocation(location);
              toast({
                title: 'Ubicación detectada',
                description: 'Se ha detectado la ubicación de la imagen para mejorar el análisis.',
              });
            }
          })
          .catch(error => {
            console.error('Error al extraer datos EXIF:', error);
          });
      }

      if (img.width < minWidth || img.height < minHeight) {
        toast({
          variant: 'destructive',
          title: 'Imagen muy pequeña',
          description: `La imagen debe ser al menos de ${minWidth}x${minHeight} píxeles.`
        });
        return;
      }

      // Guardar la imagen en el estado correspondiente
      if (isMicroscopic) {
        setMicroscopicImage(imageDataUrl);
        toast({
          title: 'Imagen microscópica cargada',
          description: 'La imagen de tricomas se ha cargado correctamente.'
        });
      } else {
        setImage(imageDataUrl);
        toast({
          title: 'Imagen cargada',
          description: 'La imagen se ha cargado correctamente.'
        });
      }
    };
    img.src = imageDataUrl;
  };



  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      // Verificar que al menos la imagen general esté cargada
      if (!image) {
        throw new Error('Por favor, sube una imagen general de la planta antes de analizar.');
      }

      // Preparar los datos para el análisis
      const analysisData: any = {
        photoUrl: image,
        description: plantDescription
      };

      // Añadir la imagen microscópica si está disponible
      if (preferences.useMicroscopicAnalysis && microscopicImage) {
        analysisData.microscopicPhotoUrl = microscopicImage;
      }

      // Añadir información de variedad si está seleccionada
      if (selectedVariety) {
        analysisData.variety = selectedVariety;
      }

      // Añadir preferencias del usuario
      analysisData.preferences = preferences;

      // Añadir datos de ubicación si están disponibles
      if (userLocation) {
        analysisData.location = userLocation;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error('Error en el análisis');
      }

      const result = await response.json();
      console.log("Resultado completo del análisis:", JSON.stringify(result, null, 2));
      console.log("¿Tiene análisis microscópico?", !!result.microscopicAnalysis);
      console.log("¿Tiene estimación de tiempo?", !!result.harvestTimeEstimation);
      console.log("¿Tiene datos climáticos?", !!result.weatherData);

      // Guardar los datos climáticos y el análisis de impacto si están disponibles
      if (result.weatherData) {
        setWeatherData(result.weatherData);
      }

      if (result.weatherImpact) {
        setWeatherImpact(result.weatherImpact);
      }

      // Guardar el resultado del análisis
      setAnalysisResult(result);

      toast({
        title: 'Análisis Completo',
        description: result.microscopicAnalysis
          ? 'Análisis completo con imagen general y microscópica generado con éxito.'
          : 'Análisis de madurez generado con éxito.',
      });
    } catch (error: any) {
      console.error('Error durante el análisis:', error);

      // Mensaje de error más detallado
      let errorMessage = error.message || 'Error al analizar la imagen. Por favor, inténtalo de nuevo.';

      // Mensaje específico para error de API key
      if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_GENAI_API_KEY')) {
        errorMessage = 'No se puede realizar el análisis porque la API de Google AI no está configurada correctamente. Por favor, contacta al administrador del sistema.';
      }

      toast({
        variant: 'destructive',
        title: 'Error de Análisis',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-4 bg-background min-h-screen overflow-auto">
      <h1 className="text-3xl font-bold mb-4 text-primary">HarvestAI</h1>

      {/* El componente ApiKeyWarning se ejecuta en el cliente para evitar errores de hidratación */}
      <ApiKeyWarning />

      <div className="w-full max-w-2xl space-y-6 mb-8">
        {/* Selector de modo: Asistente o Pestañas */}
        <div className="flex justify-end mb-2">
          <Button
            variant={useWizard ? "default" : "outline"}
            size="sm"
            onClick={() => setUseWizard(!useWizard)}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {useWizard ? "Usando Asistente" : "Usar Asistente"}
          </Button>
        </div>

        {useWizard ? (
          <AnalysisWizard
            preferences={preferences}
            onPreferencesChange={handlePreferencesChange}
            onImageUpload={handleImageUpload}
            onCameraCapture={handleCameraCapture}
            onDescriptionChange={(value) => setPlantDescription(value)}
            onAnalyze={handleAnalyze}
            image={image}
            microscopicImage={microscopicImage}
            description={plantDescription}
            loading={loading}
            cameraOpen={cameraOpen}
            setCameraOpen={setCameraOpen}
            microscopicCameraOpen={microscopicCameraOpen}
            setMicroscopicCameraOpen={setMicroscopicCameraOpen}
          />
        ) : (
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">
                <span className="hidden sm:inline">General</span>
                <Home className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <span className="hidden sm:inline">Preferencias</span>
                <Settings className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger
                value="microscopic"
                disabled={!preferences.useMicroscopicAnalysis}
              >
                <span className="hidden sm:inline">Microscópico</span>
                <Search className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="climate">
                <span className="hidden sm:inline">Clima</span>
                <Cloud className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
              <TabsTrigger
                value="weather"
                disabled={!weatherData}
              >
                <span className="hidden sm:inline">Clima Real</span>
                <MapPin className="w-5 h-5 inline-flex sm:hidden" />
              </TabsTrigger>
            </TabsList>

          {/* Pestaña de análisis general */}
          <TabsContent value="general" className="space-y-4">
            <Card className="w-full space-y-4">
              <CardHeader>
                <CardTitle className="text-2xl">Análisis de Imagen</CardTitle>
                <CardDescription>Sube una imagen de tu planta de cannabis para determinar su madurez.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preferencias rápidas */}
                <div className="p-4 bg-muted/40 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Configuración Rápida</h3>
                  <QuickPreferences
                    preferences={preferences}
                    onPreferencesChange={handlePreferencesChange}
                    onMicroscopicToggle={(enabled) => {
                      if (enabled && !microscopicImage) {
                        // Si se activa el análisis microscópico y no hay imagen, cambiar a esa pestaña
                        setTimeout(() => setActiveTab('microscopic'), 300);
                        toast({
                          title: 'Análisis microscópico activado',
                          description: 'Ahora puedes subir una imagen de tricomas para un análisis más preciso.',
                        });
                      }
                    }}
                  />
                </div>

                <Separator className="my-2" />

                <div className="flex flex-col items-center space-y-2">
                  {image && (
                    <img src={image} alt="Cannabis Plant" className="max-h-64 rounded-md shadow-md" />
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button variant="secondary" asChild className="w-full">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        {image ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </label>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCameraOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                      {image ? 'Usar Cámara' : 'Tomar Foto'}
                    </Button>
                  </div>
                </div>

                {/* Diálogo de captura de cámara para imagen general */}
                <CameraCapture
                  open={cameraOpen}
                  onClose={() => setCameraOpen(false)}
                  onImageCapture={(imageDataUrl) => handleCameraCapture(imageDataUrl, false)}
                  title="Capturar Imagen de Cannabis"
                  description="Toma una foto clara de la planta completa o de los cogollos para analizar."
                />
                <Textarea
                  placeholder="Describe la planta (opcional)"
                  value={plantDescription}
                  onChange={(e) => setPlantDescription(e.target.value)}
                  className="resize-none"
                />

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={(!image && !microscopicImage) || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                        Analizando...
                      </div>
                    ) : (
                      'Analizar'
                    )}
                  </Button>

                  {preferences.useMicroscopicAnalysis && !microscopicImage && (
                    <Button
                      onClick={() => setActiveTab('microscopic')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <div className="flex items-center">
                        <Search className="mr-2 h-4 w-4" />
                        Añadir imagen microscópica
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={requestLocation}
                      variant="outline"
                      disabled={loadingWeather}
                      className="w-full sm:w-auto"
                    >
                    {loadingWeather ? (
                      <div className="flex items-center justify-center">
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                        Obteniendo ubicación...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Usar ubicación
                      </div>
                    )}
                    </Button>

                    <Button
                      onClick={() => setActiveTab('weather')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Seleccionar ubicación
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de preferencias */}
          <TabsContent value="preferences" className="space-y-4">
            <CannabisPreferences
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          </TabsContent>

          {/* Pestaña de análisis microscópico */}
          <TabsContent value="microscopic" className="space-y-4">
            <Card className="w-full space-y-4">
              <CardHeader>
                <CardTitle className="text-2xl">Análisis Microscópico</CardTitle>
                <CardDescription>
                  Sube una imagen de cerca de los tricomas para un análisis más preciso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  {microscopicImage && (
                    <img src={microscopicImage} alt="Tricomas" className="max-h-64 rounded-md shadow-md" />
                  )}
                  <Input
                    id="microscopic-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button variant="secondary" asChild className="w-full">
                      <label htmlFor="microscopic-upload" className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        {microscopicImage ? 'Cambiar Imagen' : 'Subir Imagen de Tricomas'}
                      </label>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMicroscopicCameraOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                      {microscopicImage ? 'Usar Cámara' : 'Tomar Foto'}
                    </Button>
                  </div>
                </div>

                {/* Diálogo de captura de cámara para imagen microscópica */}
                <CameraCapture
                  open={microscopicCameraOpen}
                  onClose={() => setMicroscopicCameraOpen(false)}
                  onImageCapture={(imageDataUrl) => handleCameraCapture(imageDataUrl, true)}
                  title="Capturar Imagen Microscópica"
                  description="Toma una foto clara de los tricomas para un análisis más preciso."
                />
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Consejos para imágenes microscópicas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Usa un lente macro o microscopio USB (30x-60x)</li>
                    <li>Asegúrate de que haya buena iluminación</li>
                    <li>Enfoca en los tricomas de los cogollos</li>
                    <li>Mantente estable para evitar imágenes borrosas</li>
                  </ul>
                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('general')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Volver a General
                  </Button>

                  <Button
                    onClick={handleAnalyze}
                    disabled={(!image && !microscopicImage) || loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                        Analizando...
                      </div>
                    ) : (
                      'Analizar'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de clima */}
          <TabsContent value="climate" className="space-y-4">
            <ClimateConditions variety={selectedVariety} />
          </TabsContent>

          {/* Pestaña de clima en tiempo real */}
          <TabsContent value="weather" className="space-y-4">
            {weatherData && weatherImpact ? (
              <div className="space-y-4">


                <WeatherImpact
                  variety={selectedVariety}
                  ripenessLevel={analysisResult?.ripenessLevel}
                  weatherData={weatherData}
                  weatherImpact={weatherImpact}
                  onRequestLocation={requestLocation}
                  onManualLocationSelected={handleLocationSelected}
                  isLoading={loadingWeather}
                />

                {/* Componente para personalizar umbrales climáticos */}
                {analysisResult?.ripenessLevel && (
                  <WeatherPreferences
                    preferences={{
                      temperature_min: 18,
                      temperature_max: 28,
                      humidity_min: 40,
                      humidity_max: 60,
                      uv_index_min: 2,
                      uv_index_max: 7,
                      useCustomThresholds: false
                    }}
                    onChange={(newPreferences: any) => {
                      // Aquí se podría implementar la lógica para recalcular el impacto climático
                      // con los nuevos umbrales personalizados
                      console.log('Nuevas preferencias climáticas:', newPreferences);
                      toast({
                        title: 'Preferencias actualizadas',
                        description: 'Los umbrales climáticos han sido actualizados correctamente.',
                      });
                    }}
                    floweringStage={'MID_FLOWERING'}
                  />
                )}
              </div>
            ) : (
              <WeatherFallback
                onRequestLocation={requestLocation}
                onManualLocationSelected={handleLocationSelected}
                isLoading={loadingWeather}
                currentLocation={userLocation}
                error={hasGeolocationPermission === false ?
                  'Tu navegador no soporta geolocalización o has bloqueado el permiso.' :
                  undefined
                }
              />
            )}
          </TabsContent>
          </Tabs>
        )}

        {/* Resultados del análisis */}
        {analysisResult && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-accent">Resultados del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-card rounded-lg overflow-auto max-h-[60vh] sm:max-h-none">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <span className="text-lg font-medium">
                    Estado de Madurez: {analysisResult.ripenessLevel || 'No determinado'}
                  </span>
                  <Badge variant={
                    analysisResult.confidence > 0.7 ? "default" :
                    analysisResult.confidence > 0.4 ? "secondary" : "destructive"
                  }>
                    Confianza: {((analysisResult.confidence || 0) * 100).toFixed(1)}%
                  </Badge>
                </div>

                {/* Logs de depuración */}
                {(() => {
                  console.log("Antes de renderizar componentes condicionales:", analysisResult);
                  console.log("harvestTimeEstimation:", analysisResult.harvestTimeEstimation);
                  console.log("microscopicAnalysis:", analysisResult.microscopicAnalysis);
                  return null;
                })()}

                {/* Estimación de tiempo hasta cosecha */}
                {analysisResult.ripenessLevel && (
                  <div className={`mb-4 p-3 ${analysisResult.harvestTimeEstimation && analysisResult.harvestTimeEstimation.daysToHarvest === 0 ? 'bg-red-500/20' : 'bg-accent/20'} rounded-md`}>
                    <h3 className="font-medium mb-2">
                      {analysisResult.harvestTimeEstimation && analysisResult.harvestTimeEstimation.daysToHarvest === 0
                        ? 'Alerta de Cosecha'
                        : 'Tiempo hasta Cosecha'}
                    </h3>
                    {analysisResult.harvestTimeEstimation ? (
                      analysisResult.harvestTimeEstimation.daysToHarvest === 0 ? (
                        // Caso especial: la planta ha pasado su punto óptimo
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg font-bold text-red-600">Cosecha Inmediata Recomendada</p>
                          </div>
                          <p className="text-sm">{analysisResult.harvestTimeEstimation.harvestWindow}</p>
                          <p className="text-sm mt-2 font-medium">
                            Fecha límite: {analysisResult.harvestTimeEstimation.optimalHarvestDate}
                          </p>
                        </div>
                      ) : (
                        // Caso normal: la planta aún no ha pasado su punto óptimo
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-semibold">Días estimados:</p>
                              <p className="text-2xl font-bold">{analysisResult.harvestTimeEstimation.daysToHarvest}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Fecha óptima:</p>
                              <p className="text-md">{analysisResult.harvestTimeEstimation.optimalHarvestDate}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2">
                            <span className="font-semibold">Ventana de cosecha:</span> {analysisResult.harvestTimeEstimation.harvestWindow}
                          </p>
                        </>
                      )
                    ) : (
                      <p className="text-sm">Información de tiempo hasta cosecha no disponible. Selecciona una variedad en la pestaña de preferencias para obtener esta información.</p>
                    )}
                  </div>
                )}

                {/* Análisis microscópico */}
                {analysisResult.ripenessLevel && (
                  <div className="mb-4 p-3 bg-secondary/20 rounded-md">
                    <h3 className="font-medium mb-2">Análisis de Tricomas:</h3>
                    {analysisResult.microscopicAnalysis ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="text-center p-1 bg-background/50 rounded">
                            <p className="text-xs">Transparentes</p>
                            <p className="text-lg font-bold">{analysisResult.microscopicAnalysis.clearTrichomes}%</p>
                          </div>
                          <div className="text-center p-1 bg-background/50 rounded">
                            <p className="text-xs">Lechosos</p>
                            <p className="text-lg font-bold">{analysisResult.microscopicAnalysis.milkyTrichomes}%</p>
                          </div>
                          <div className="text-center p-1 bg-background/50 rounded">
                            <p className="text-xs">Ámbar</p>
                            <p className="text-lg font-bold">{analysisResult.microscopicAnalysis.amberTrichomes}%</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">Descripción:</span> {analysisResult.microscopicAnalysis.trichomeDescription}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm">Información de análisis microscópico no disponible.
                        {!preferences.useMicroscopicAnalysis ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => {
                              handlePreferencesChange({
                                ...preferences,
                                useMicroscopicAnalysis: true
                              });
                              setTimeout(() => setActiveTab('microscopic'), 300);
                            }}
                          >
                            Activar análisis microscópico
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => setActiveTab('microscopic')}
                          >
                            Subir imagen de tricomas
                          </Button>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Características generales */}
                {analysisResult.characteristics && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Características Observadas:</h3>
                    <div className="grid gap-3 mt-2">
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="font-semibold mb-1">Pistilos:</h4>
                        <p className="text-sm">
                          {analysisResult.characteristics.pistils.includes('No se pudieron') ? (
                            <span className="text-amber-500">
                              {analysisResult.characteristics.pistils}
                            </span>
                          ) : (
                            analysisResult.characteristics.pistils || 'No detectado'
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="font-semibold mb-1">Tricomas:</h4>
                        <p className="text-sm">
                          {analysisResult.characteristics.trichomes.includes('No se pudieron') ? (
                            <span className="text-amber-500">
                              {analysisResult.characteristics.trichomes}
                            </span>
                          ) : (
                            analysisResult.characteristics.trichomes || 'No detectado'
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="font-semibold mb-1">Color de Hojas:</h4>
                        <p className="text-sm">
                          {analysisResult.characteristics.leafColor.includes('No se pudo') ? (
                            <span className="text-amber-500">
                              {analysisResult.characteristics.leafColor}
                            </span>
                          ) : (
                            analysisResult.characteristics.leafColor || 'No detectado'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Mensaje de ayuda cuando hay errores de análisis */}
                    {(analysisResult.characteristics.pistils.includes('No se pudieron') ||
                      analysisResult.characteristics.trichomes.includes('No se pudieron') ||
                      analysisResult.characteristics.leafColor.includes('No se pudo')) && (
                      <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-500 rounded-md">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Sugerencias para mejorar el análisis:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-400">
                          <li>Asegúrate de que la imagen esté bien enfocada y tenga buena iluminación</li>
                          <li>Toma la foto más cerca de la planta para capturar detalles</li>
                          <li>Para análisis de tricomas, considera usar una imagen microscópica</li>
                          <li>Evita sombras excesivas o reflejos en la imagen</li>
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h3 className="font-medium mb-1">Recomendación Personalizada:</h3>
                      <p className="text-sm">
                        {preferences && selectedVariety
                          ? getCustomizedRecommendation(
                              analysisResult.ripenessLevel,
                              selectedVariety,
                              preferences.harvestPreference
                            )
                          : RIPENESS_CRITERIA[analysisResult.ripenessLevel as keyof typeof RIPENESS_CRITERIA]?.recommendedAction ||
                            'No hay recomendaciones disponibles para este nivel de madurez.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setAnalysisResult(null)}
                  className="text-sm"
                >
                  Volver a analizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
