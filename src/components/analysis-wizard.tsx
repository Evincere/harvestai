'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CameraCapture } from '@/components/camera-capture';
import { QuickPreferences } from '@/components/quick-preferences';
import { Separator } from '@/components/ui/separator';
import { CANNABIS_VARIETIES, UserPreferences } from '@/types/cannabis';
import { ArrowRight, ArrowLeft, Upload, Camera, Check, HelpCircle } from 'lucide-react';
import { Spinner } from '@/components/icons';

interface AnalysisWizardProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>, isMicroscopic: boolean) => void;
  onCameraCapture: (imageDataUrl: string, isMicroscopic: boolean) => void;
  onDescriptionChange: (description: string) => void;
  onAnalyze: () => void;
  image: string | null;
  microscopicImage: string | null;
  description: string;
  loading: boolean;
  cameraOpen: boolean;
  setCameraOpen: (open: boolean) => void;
  microscopicCameraOpen: boolean;
  setMicroscopicCameraOpen: (open: boolean) => void;
}

export function AnalysisWizard({
  preferences,
  onPreferencesChange,
  onImageUpload,
  onCameraCapture,
  onDescriptionChange,
  onAnalyze,
  image,
  microscopicImage,
  description,
  loading,
  cameraOpen,
  setCameraOpen,
  microscopicCameraOpen,
  setMicroscopicCameraOpen
}: AnalysisWizardProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = preferences.useMicroscopicAnalysis ? 3 : 2;

  const goToNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleMicroscopicToggle = (enabled: boolean) => {
    // Actualizar el número total de pasos si se activa/desactiva el análisis microscópico
    if (enabled && step === 2) {
      // Si estamos en el último paso y se activa el análisis microscópico, no avanzamos automáticamente
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Asistente de Análisis</CardTitle>
          <div className="text-sm text-muted-foreground">
            Paso {step} de {totalSteps}
          </div>
        </div>
        <CardDescription>
          {step === 1 && "Configura tus preferencias y sube una imagen general de la planta"}
          {step === 2 && !preferences.useMicroscopicAnalysis && "Revisa y analiza tu planta"}
          {step === 2 && preferences.useMicroscopicAnalysis && "Sube una imagen microscópica de los tricomas"}
          {step === 3 && "Revisa y analiza tu planta"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Paso 1: Preferencias y carga de imagen general */}
        {step === 1 && (
          <div className="space-y-4">
            <QuickPreferences
              preferences={preferences}
              onPreferencesChange={onPreferencesChange}
              onMicroscopicToggle={handleMicroscopicToggle}
            />

            <Separator className="my-4" />

            <div className="flex flex-col items-center space-y-2">
              {image && (
                <img src={image} alt="Cannabis Plant" className="max-h-64 rounded-md shadow-md" />
              )}
              <Input
                id="wizard-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageUpload(e, false)}
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="secondary" asChild className="w-full">
                  <label htmlFor="wizard-image-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {image ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </label>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCameraOpen(true)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {image ? 'Usar Cámara' : 'Tomar Foto'}
                </Button>
              </div>
            </div>

            <CameraCapture
              open={cameraOpen}
              onClose={() => setCameraOpen(false)}
              onImageCapture={(imageDataUrl) => onCameraCapture(imageDataUrl, false)}
              title="Capturar Imagen de Cannabis"
              description="Toma una foto clara de la planta completa o de los cogollos para analizar."
            />

            <Textarea
              placeholder="Describe la planta (opcional)"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="resize-none"
            />
          </div>
        )}

        {/* Paso 2: Imagen microscópica (si está habilitada) o análisis final */}
        {step === 2 && preferences.useMicroscopicAnalysis && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              {microscopicImage && (
                <img src={microscopicImage} alt="Tricomas" className="max-h-64 rounded-md shadow-md" />
              )}
              <Input
                id="wizard-microscopic-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageUpload(e, true)}
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="secondary" asChild className="w-full">
                  <label htmlFor="wizard-microscopic-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {microscopicImage ? 'Cambiar Imagen' : 'Subir Imagen de Tricomas'}
                  </label>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMicroscopicCameraOpen(true)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {microscopicImage ? 'Usar Cámara' : 'Tomar Foto'}
                </Button>
              </div>
            </div>

            <CameraCapture
              open={microscopicCameraOpen}
              onClose={() => setMicroscopicCameraOpen(false)}
              onImageCapture={(imageDataUrl) => onCameraCapture(imageDataUrl, true)}
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
          </div>
        )}

        {/* Paso 2 o 3: Resumen y análisis final */}
        {((step === 2 && !preferences.useMicroscopicAnalysis) || step === 3) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Imagen General</h3>
                {image ? (
                  <img src={image} alt="Cannabis Plant" className="max-h-48 rounded-md shadow-md" />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                    <p className="text-muted-foreground">No hay imagen</p>
                  </div>
                )}
              </div>

              {preferences.useMicroscopicAnalysis && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Imagen Microscópica</h3>
                  {microscopicImage ? (
                    <img src={microscopicImage} alt="Tricomas" className="max-h-48 rounded-md shadow-md" />
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                      <p className="text-muted-foreground">No hay imagen</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/40 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Configuración</h3>
              <ul className="space-y-1">
                <li><strong>Variedad:</strong> {preferences.preferredVarieties.length > 0 ?
                CANNABIS_VARIETIES.find(v => v.id === preferences.preferredVarieties[0])?.name || 'Desconocida'
                : 'No seleccionada'}</li>
                <li><strong>Preferencia:</strong> {preferences.harvestPreference}</li>
                <li><strong>Análisis microscópico:</strong> {preferences.useMicroscopicAnalysis ? 'Activado' : 'Desactivado'}</li>
              </ul>
            </div>

            {description && (
              <div className="p-4 bg-muted/40 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Descripción</h3>
                <p>{description}</p>
              </div>
            )}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={goToPreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          ) : (
            <div></div> // Espacio vacío para mantener la alineación
          )}

          {step < totalSteps ? (
            <Button
              onClick={goToNextStep}
              disabled={step === 1 && !image} // Deshabilitar si estamos en el paso 1 y no hay imagen
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onAnalyze}
              disabled={loading || (!image && !microscopicImage)}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </div>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Analizar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
