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

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ripenessLevel, setRipenessLevel] = useState('');
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
    try {
      // Simulate AI analysis to determine ripeness level
      // In a real application, this would be replaced with an actual AI model
      const simulatedRipeness = 'Medio'; // Example: Early, Mid, Late
      setRipenessLevel(simulatedRipeness);

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 psychedelic-bg">
      <h1 className="text-4xl font-bold mb-4 text-primary holographic-effect">HarvestAI</h1>
      <Card className="w-full max-w-md space-y-4 glassmorphism">
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
            <Button variant="secondary" className="elegant-button" asChild>
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
          <Button onClick={handleAnalyze} disabled={!image || loading} className="elegant-button">
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              'Analizar'
            )}
          </Button>
          {ripenessLevel && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-accent psychedelic-text">Resultados del Análisis</h2>
              <p>
                Tiempo de Cosecha Estimado:{' '}
                <span className="font-bold">{loading ? <Skeleton className="h-4 w-24" /> : `Listo para cosechar en 1 semana (${ripenessLevel})`}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
