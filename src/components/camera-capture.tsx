'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, RotateCw, X, Check, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  open: boolean;
  title?: string;
  description?: string;
}

export function CameraCapture({
  onImageCapture,
  onClose,
  open,
  title = "Capturar Imagen",
  description = "Usa la cámara de tu dispositivo para tomar una foto"
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Iniciar la cámara cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  // Verificar si hay múltiples cámaras disponibles
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(err => {
          console.error("Error enumerando dispositivos:", err);
        });
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara");
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error al acceder a la cámara:", err);
      setError(err.message || "No se pudo acceder a la cámara");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir a data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const confirmImage = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
      onClose();
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50 p-4 text-center">
              <div>
                <p className="font-bold mb-2">Error de cámara</p>
                <p>{error}</p>
              </div>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Canvas oculto para capturar la imagen */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={retakeImage} type="button">
                <RefreshCw className="mr-2 h-4 w-4" />
                Volver a tomar
              </Button>
              <Button onClick={confirmImage} type="button">
                <Check className="mr-2 h-4 w-4" />
                Usar esta foto
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} type="button">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <div className="flex gap-2">
                {hasMultipleCameras && (
                  <Button variant="outline" onClick={switchCamera} type="button">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Cambiar cámara
                  </Button>
                )}
                <Button onClick={captureImage} type="button">
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
