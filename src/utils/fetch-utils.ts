/**
 * Utilidad para realizar peticiones fetch con opciones para manejar errores de certificado SSL
 * Solo para uso en desarrollo - NO usar en producción
 */

/**
 * Realiza una petición fetch con opciones para ignorar errores de certificado SSL
 * @param url URL a la que se realizará la petición
 * @param options Opciones adicionales para fetch
 * @returns Promesa con la respuesta de fetch
 */
export async function fetchWithSSLSupport(url: string, options: RequestInit = {}): Promise<Response> {
  // En entorno de desarrollo, podemos usar la opción NODE_TLS_REJECT_UNAUTHORIZED=0
  // que permite ignorar errores de certificado SSL
  if (process.env.NODE_ENV === 'development') {
    // En Node.js, podemos usar la opción agent para configurar el comportamiento SSL
    // pero en el navegador esto no es posible, así que usamos un proxy o una solución alternativa
    
    // Para Next.js, podemos usar un proxy en la API route
    if (url.startsWith('https://') && typeof window === 'undefined') {
      // Estamos en el servidor (API route)
      // Usar la versión de node-fetch que permite configurar el agente SSL
      try {
        // Intentar la petición normal primero
        return await fetch(url, options);
      } catch (error) {
        console.warn('Error SSL en fetch, intentando con proxy:', error);
        
        // Si falla, intentar a través de un proxy o directamente con la opción de ignorar SSL
        // Esta es una solución temporal solo para desarrollo
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        return fetch(proxyUrl, options);
      }
    }
  }
  
  // En producción o en el navegador, usar fetch normal
  return fetch(url, options);
}
