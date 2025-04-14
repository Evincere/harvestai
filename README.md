# HarvestAI - Asistente Inteligente para Cultivadores de Cannabis

HarvestAI es una aplicación web avanzada diseñada para ayudar a cultivadores de cannabis a determinar el momento óptimo de cosecha mediante análisis de imágenes con inteligencia artificial y datos climáticos en tiempo real.

## Características Principales

### Análisis de Imágenes con IA
- **Análisis de Madurez**: Determina el nivel de madurez de la planta (Temprano, Medio, Tardío) mediante análisis de imágenes.
- **Análisis Microscópico**: Permite analizar imágenes de tricomas para una evaluación más precisa.
- **Captura de Imágenes**: Soporte para carga de archivos y captura directa desde la cámara del dispositivo.
- **Extracción de Metadatos**: Obtiene datos de geolocalización de las imágenes EXIF cuando están disponibles.

### Análisis Climático
- **Datos Climáticos en Tiempo Real**: Integración con APIs de clima para obtener condiciones actuales.
- **Pronóstico Meteorológico**: Muestra previsiones para los próximos días.
- **Análisis de Impacto**: Evalúa cómo las condiciones climáticas afectan el momento óptimo de cosecha.
- **Alertas de Granizo**: Sistema de alerta temprana para detectar posibles eventos de granizo.
- **Selección Manual de Ubicación**: Permite al usuario elegir manualmente su ubicación o usar geolocalización automática.

### Personalización
- **Preferencias de Usuario**: Configuración de variedades preferidas y umbrales climáticos.
- **Variedades de Cannabis**: Base de datos con diferentes variedades y sus características específicas.
- **Recomendaciones Personalizadas**: Consejos adaptados según la variedad, etapa de crecimiento y condiciones climáticas.

### Visualización de Datos
- **Gráficos Climáticos**: Visualización de la evolución de temperatura y humedad.
- **Indicadores de Impacto**: Representación visual del impacto de las condiciones climáticas.
- **Interfaz Adaptativa**: Diseño responsive para dispositivos móviles y de escritorio.

## Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con renderizado del lado del servidor.
- **TypeScript**: Tipado estático para desarrollo más robusto.
- **Tailwind CSS**: Framework CSS para diseño rápido y consistente.
- **Shadcn/UI**: Componentes de interfaz de usuario reutilizables.
- **Lucide React**: Iconos vectoriales modernos.

### APIs y Servicios
- **Google Generative AI**: Análisis de imágenes de cannabis mediante modelos de visión por computadora.
- **OpenWeatherMap**: Datos climáticos actuales y pronósticos.
- **Geolocalización**: API del navegador para obtener la ubicación del usuario.
- **OpenStreetMap (Nominatim)**: Geocodificación para búsqueda de ubicaciones.

### Características Técnicas
- **Modo Offline**: Capacidad de análisis básico sin conexión a internet.
- **Procesamiento de Imágenes**: Validación y optimización de imágenes en el cliente.
- **Extracción EXIF**: Obtención de metadatos de imágenes para mejorar el análisis.
- **Almacenamiento Local**: Guardado de preferencias del usuario en localStorage.

## Funcionalidades Detalladas

### Análisis de Imágenes
1. **Carga de Imágenes**: Soporte para formatos JPG, PNG y WebP.
2. **Captura con Cámara**: Toma de fotos directamente desde el dispositivo.
3. **Validación de Imágenes**: Verificación de tamaño, dimensiones y formato.
4. **Descripción Textual**: Campo opcional para proporcionar contexto adicional.
5. **Análisis Microscópico**: Evaluación de tricomas para determinar madurez con mayor precisión.

### Análisis Climático
1. **Condiciones Actuales**: Temperatura, humedad, índice UV, viento y precipitación.
2. **Pronóstico de 7 Días**: Previsión de condiciones climáticas futuras.
3. **Detección de Condiciones Adversas**: Identificación de situaciones que pueden afectar negativamente a la planta.
4. **Alertas de Granizo**: Notificaciones sobre posibles eventos de granizo con recomendaciones específicas.
5. **Selección de Ubicación**: Múltiples métodos para especificar la ubicación (automática, búsqueda, coordenadas).

### Recomendaciones
1. **Tiempo Hasta Cosecha**: Estimación de días restantes hasta el punto óptimo.
2. **Ajustes por Clima**: Modificación de recomendaciones según condiciones climáticas.
3. **Consejos Específicos por Variedad**: Recomendaciones adaptadas al tipo de cannabis.
4. **Medidas Preventivas**: Sugerencias para proteger las plantas de condiciones adversas.
5. **Indicadores de Confianza**: Nivel de certeza en las predicciones realizadas.

## Requisitos del Sistema

### Navegadores Compatibles
- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

### Dispositivos
- **Escritorio**: Windows, macOS, Linux
- **Móvil**: Android 7.0+, iOS 13+
- **Recomendado**: Dispositivo con cámara para funcionalidad completa

### Permisos Requeridos
- Acceso a la cámara (opcional, para captura de imágenes)
- Geolocalización (opcional, para datos climáticos precisos)

## Configuración

### Variables de Entorno
El proyecto utiliza un archivo `.env` para las variables de entorno. Este archivo está incluido en `.gitignore` y no se sube al repositorio por razones de seguridad.

**Importante**: Después de clonar el repositorio o hacer un `git pull`, deberás crear o restaurar tu archivo `.env` manualmente. Para facilitar este proceso, hemos incluido un archivo `.env.example` que puedes copiar:

```bash
# Copiar el archivo de ejemplo (solo necesitas hacer esto una vez)
cp .env.example .env

# Luego edita el archivo .env con tus propias claves API
```

Variables de entorno necesarias:
```
GOOGLE_GENAI_API_KEY=tu_api_key_de_google_ai
NEXT_PUBLIC_ENABLE_CLIENT_AI=true
NEXT_PUBLIC_APP_VERSION=0.1.0

# APIs de clima
OPENWEATHERMAP_API_KEY=tu_api_key_de_openweathermap
VISUALCROSSING_API_KEY=tu_api_key_de_visualcrossing
WEATHERAPI_KEY=tu_api_key_de_weatherapi
AERISWEATHER_CLIENT_ID=tu_client_id_de_aerisweather
AERISWEATHER_CLIENT_SECRET=tu_client_secret_de_aerisweather

# Configuración de la aplicación
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_CLIENT_AI=false
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
```

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Evincere/harvestai.git

# Instalar dependencias
cd harvestai
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus propias claves API

# Iniciar en modo desarrollo
npm run dev
```

## Limitaciones Conocidas
- El análisis de imágenes requiere una API key válida de Google Generative AI.
- La precisión del análisis depende de la calidad de las imágenes proporcionadas.
- Los datos climáticos pueden no estar disponibles para ubicaciones muy remotas.
- La funcionalidad de cámara requiere permisos del navegador y puede variar según el dispositivo.

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios importantes antes de enviar un pull request.

## Licencia
Este proyecto está licenciado bajo [MIT License](LICENSE).

---

Desarrollado con ❤️ para la comunidad de cultivadores responsables.