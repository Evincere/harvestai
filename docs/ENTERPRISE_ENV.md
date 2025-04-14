# Configuración para Entorno Empresarial

Este documento describe cómo configurar y ejecutar la aplicación en un entorno empresarial con restricciones de red y proxy.

## Configuración

La aplicación está diseñada para funcionar en dos entornos diferentes:

1. **Entorno Normal**: Sin restricciones de red o proxy.
2. **Entorno Empresarial**: Con restricciones de red, proxy y posibles problemas de certificados SSL.

## Cómo cambiar entre entornos

Para cambiar entre los dos entornos, simplemente ejecuta el script `switch-env.bat`:

```bash
# Ejecutar el script
./switch-env.bat