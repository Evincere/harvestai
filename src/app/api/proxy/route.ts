import { NextRequest, NextResponse } from 'next/server';

/**
 * API route que actúa como proxy para peticiones a APIs externas
 * Solo se usa en entorno empresarial cuando es necesario
 */
export async function GET(request: NextRequest) {
  // Obtener la URL de la query
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL no proporcionada' },
      { status: 400 }
    );
  }
  
  try {
    // En desarrollo, podemos usar la opción de ignorar errores de certificado
    // Esto solo funciona en el servidor Node.js, no en el navegador
    if (process.env.NODE_ENV === 'development') {
      // Configurar temporalmente NODE_TLS_REJECT_UNAUTHORIZED=0 para esta petición
      // ADVERTENCIA: Esto es inseguro y solo debe usarse en desarrollo
      const originalValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      const response = await fetch(url);
      
      // Restaurar la configuración de seguridad
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalValue;
      
      // Obtener los datos de la respuesta
      const data = await response.json();
      
      // Devolver los datos como respuesta
      return NextResponse.json(data);
    } else {
      // En producción, no permitimos este proxy por razones de seguridad
      return NextResponse.json(
        { error: 'Proxy no disponible en producción' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error en el proxy:', error);
    return NextResponse.json(
      { error: 'Error al realizar la petición proxy' },
      { status: 500 }
    );
  }
}
