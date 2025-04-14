# Solución a problemas de certificados SSL

## Problema

Cuando se ejecuta la aplicación en ciertos entornos corporativos o redes con políticas de seguridad estrictas, pueden aparecer errores relacionados con certificados SSL al intentar conectarse a APIs externas:

```
Error: self-signed certificate in certificate chain
code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

Este error ocurre cuando Node.js no puede verificar la cadena de certificados SSL al hacer peticiones a las APIs externas.

## Solución implementada

Para solucionar este problema en entornos de desarrollo, se han implementado las siguientes medidas:

1. **Utilidad `fetchWithSSLSupport`**: Una función wrapper para `fetch` que maneja los errores de certificado SSL en desarrollo.
2. **API de proxy**: Un endpoint `/api/proxy` que actúa como intermediario para las peticiones a APIs externas.
3. **Configuración de Next.js**: Modificación de `next.config.js` para deshabilitar la verificación de certificados SSL en desarrollo.

> ⚠️ **ADVERTENCIA**: Estas soluciones son SOLO para entornos de desarrollo. Nunca deben usarse en producción, ya que comprometen la seguridad de la aplicación.

## Uso en producción

Para entornos de producción, se recomienda:

1. **Instalar certificados corporativos**: Si estás en un entorno corporativo, instala los certificados de la empresa en el almacén de confianza del sistema.
2. **Configurar un proxy inverso**: Utiliza un proxy inverso como Nginx o Apache para manejar las conexiones SSL.
3. **Usar servicios de proxy de API**: Considera usar servicios como Cloudflare Workers o AWS API Gateway para manejar las conexiones a APIs externas.

## Solución alternativa para desarrollo local

Si sigues teniendo problemas en tu entorno de desarrollo local, puedes ejecutar la aplicación con la siguiente variable de entorno:

```bash
# Windows (PowerShell)
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run dev

# Windows (CMD)
set NODE_TLS_REJECT_UNAUTHORIZED=0 && npm run dev

# Linux/Mac
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

> ⚠️ **ADVERTENCIA**: Esto deshabilita completamente la verificación de certificados SSL en toda la aplicación. Úsalo solo en entornos de desarrollo controlados y nunca en producción.
