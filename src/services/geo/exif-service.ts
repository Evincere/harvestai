import { GeoLocation } from '@/types/weather';
import EXIF from 'exif-js';

export class ExifService {
  /**
   * Extrae datos de geolocalización de una imagen en formato base64
   * @param base64Image Imagen en formato base64
   * @returns Datos de geolocalización o null si no se encuentran
   */
  async extractGeoLocation(base64Image: string): Promise<GeoLocation | null> {
    try {
      // Verificar que la imagen sea válida
      if (!base64Image || !base64Image.startsWith('data:image')) {
        console.warn('Formato de imagen no válido para extracción de EXIF');
        return null;
      }

      // Crear una imagen para cargar los datos
      const img = new Image();

      // Esperar a que la imagen se cargue
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = base64Image;
      });

      // Extraer los datos EXIF
      return new Promise((resolve) => {
        EXIF.getData(img, function () {
          try {
            // Verificar si hay datos GPS
            if (!EXIF.getTag(this, 'GPSLatitude') || !EXIF.getTag(this, 'GPSLongitude')) {
              console.warn('No se encontraron datos GPS en la imagen');
              resolve(null);
              return;
            }

            // Extraer latitud
            const latitudeRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
            const latitudeArray = EXIF.getTag(this, 'GPSLatitude');

            if (!latitudeArray || !Array.isArray(latitudeArray)) {
              console.warn('Formato de latitud inválido');
              resolve(null);
              return;
            }

            // Convertir los valores de latitud
            let latitude;
            try {
              latitude = this.convertDMSToDD(
                latitudeArray[0].numerator / latitudeArray[0].denominator,
                latitudeArray[1].numerator / latitudeArray[1].denominator,
                latitudeArray[2].numerator / latitudeArray[2].denominator,
                latitudeRef
              );
            } catch (error) {
              console.warn('Error al convertir latitud:', error);
              resolve(null);
              return;
            }

            // Extraer longitud
            const longitudeRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';
            const longitudeArray = EXIF.getTag(this, 'GPSLongitude');

            if (!longitudeArray || !Array.isArray(longitudeArray)) {
              console.warn('Formato de longitud inválido');
              resolve(null);
              return;
            }

            // Convertir los valores de longitud
            let longitude;
            try {
              longitude = this.convertDMSToDD(
                longitudeArray[0].numerator / longitudeArray[0].denominator,
                longitudeArray[1].numerator / longitudeArray[1].denominator,
                longitudeArray[2].numerator / longitudeArray[2].denominator,
                longitudeRef
              );
            } catch (error) {
              console.warn('Error al convertir longitud:', error);
              resolve(null);
              return;
            }

            resolve({
              latitude,
              longitude
            });
          } catch (error) {
            console.error('Error al procesar datos EXIF:', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error al extraer geolocalización:', error);
      return null;
    }
  }

  /**
   * Convierte una imagen base64 a ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Extraer solo los datos base64 (sin el prefijo)
    const base64Data = base64.split(',')[1];
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * Convierte coordenadas en formato DMS (grados, minutos, segundos) a DD (grados decimales)
   */
  private convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string): number {
    let dd = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
      dd = -dd;
    }

    return dd;
  }
}
