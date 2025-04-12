'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Skeleton} from '@/components/ui/skeleton';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import { analyzeCannabisImage, type AnalyzeCannabisImageOutput } from '@/ai/flows/analyze-cannabis-image';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCannabisImageOutput | null>(null);
  const [plantDescription, setPlantDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la Cámara Denegado',
          description: 'Por favor, habilita los permisos de la cámara en la configuración de tu navegador para usar esta aplicación.',
        });
      }
    };

    getCameraPermission();
  }, []);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null); // Clear previous results
    try {
      if (!image) {
        throw new Error('Por favor, sube una imagen antes de analizar.');
      }

      const result = await analyzeCannabisImage({
        photoUrl: image,
        description: plantDescription,
      });

      setAnalysisResult(result);

      toast({
        title: 'Análisis Completo',
        description: 'Análisis de madurez generado con éxito.',
      });
    } catch (error: any) {
      console.error('Error durante el análisis:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Análisis',
        description: error.message || 'Error al analizar la imagen. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <h1 className="text-4xl font-bold mb-4 text-primary ">HarvestAI</h1>
      <Card className="w-full max-w-md space-y-4 ">
        <CardHeader>
          <CardTitle className="text-2xl">Análisis de Imagen</CardTitle>
          <CardDescription>Sube una imagen de tu planta de cannabis para determinar su madurez.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            {image ? (
              <img src={image} alt="Cannabis Plant" className="max-h-64 rounded-md shadow-md" />
            ) : (
              <>
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />

                { !(hasCameraPermission) && (
                    <Alert variant="destructive">
                              <AlertTitle>Acceso a la Cámara Requerido</AlertTitle>
                              <AlertDescription>
                                Por favor, permite el acceso a la cámara para usar esta función.
                              </AlertDescription>
                      </Alert>
                )
                }
              </>
            )}
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button variant="secondary"  asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                {image ? 'Cambiar Imagen' : 'Subir Imagen'}
              </label>
            </Button>
          </div>
          <Textarea
            placeholder="Describe la planta (opcional)"
            value={plantDescription}
            onChange={(e) => setPlantDescription(e.target.value)}
            className="resize-none"
          />
          <Button onClick={handleAnalyze} disabled={!image || loading} >
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              'Analizar'
            )}
          </Button>
          {analysisResult && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-accent ">Resultados del Análisis</h2>
              <p>
                Tiempo de Cosecha Estimado:{' '}
                <span className="font-bold">
                  {loading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    `Madurez: ${analysisResult.ripenessLevel} (Confianza: ${(analysisResult.confidence * 100).toFixed(2)}%)`
                  )}
                </span>
              </p>
              {analysisResult.additionalNotes && (
                <p>
                  Notas Adicionales: <span className="font-bold">{analysisResult.additionalNotes}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
