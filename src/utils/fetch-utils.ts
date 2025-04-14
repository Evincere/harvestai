/**
 * Utilidad para realizar peticiones fetch con compatibilidad para diferentes entornos
 */

// Detectar si estamos en entorno empresarial
const isEnterpriseEnvironment = () => {
    return process.env.ENTERPRISE_ENV === 'true' || 
           (typeof window !== 'undefined' && 
            window.location.hostname.includes('empresa.com'));
  };
  
  /**
   * Realiza una petición fetch adaptada al entorno
   * @param url URL a la que se realizará la petición
   * @param options Opciones adicionales para fetch
   * @returns Promesa con la respuesta de fetch
   */
  export async function fetchWithSSLSupport(url: string, options: RequestInit = {}): Promise<Response> {
    // En entorno empresarial, usar configuración especial
    if (isEnterpriseEnvironment()) {
      console.log('Usando configuración para entorno empresarial');
      
      // Si estamos en el servidor y en desarrollo
      if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
        try {
          // Intentar la petición normal primero
          return await fetch(url, options);
        } catch (error) {
          console.warn('Error SSL en fetch, intentando con proxy:', error);
          
          // Si falla, intentar a través del proxy
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
          return fetch(proxyUrl, options);
        }
      }
    }
    
    // En entorno normal o en el cliente, usar fetch estándar
    return fetch(url, options);
  }