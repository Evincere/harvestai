/**
 * Versión deshabilitada de fetch-utils.ts que no realiza conexiones reales
 * Solo para uso en desarrollo - NO usar en producción
 */

/**
 * Realiza una petición fetch simulada que siempre devuelve un objeto vacío
 * @param url URL a la que se realizaría la petición
 * @param options Opciones adicionales para fetch
 * @returns Promesa con una respuesta simulada
 */
export async function fetchWithSSLSupport(url: string, options: RequestInit = {}): Promise<Response> {
  console.log(`[FETCH SIMULADO] Petición a: ${url}`);
  
  // Devolver una respuesta simulada
  return new Response(JSON.stringify({ 
    simulated: true, 
    message: "Esta es una respuesta simulada para evitar problemas de SSL/Proxy",
    url: url
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
