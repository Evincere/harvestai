'use client';

interface WeatherIconProps {
  condition: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WeatherIcon({ 
  condition, 
  size = 'md',
  className = ''
}: WeatherIconProps) {
  // Normalizar la condición climática
  const normalizedCondition = condition.toLowerCase();
  
  // Determinar el tamaño del icono
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];
  
  // Función para obtener el icono según la condición
  const getIcon = () => {
    // Soleado / Despejado
    if (normalizedCondition.includes('sol') || 
        normalizedCondition.includes('despejado') || 
        normalizedCondition.includes('clear') || 
        normalizedCondition.includes('sunny')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-yellow-500 ${className}`}>
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      );
    }
    
    // Parcialmente nublado
    if (normalizedCondition.includes('parcial') || 
        normalizedCondition.includes('partly') || 
        (normalizedCondition.includes('cloud') && normalizedCondition.includes('sun'))) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-blue-400 ${className}`}>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
          <path d="M10 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"></path>
          <path d="M10.5 16a7.5 7.5 0 0 0-7.5-7.5"></path>
          <path d="M16 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"></path>
          <path d="M22 16a6 6 0 0 0-6-6 6 6 0 0 0-6 6"></path>
        </svg>
      );
    }
    
    // Nublado
    if (normalizedCondition.includes('nub') || 
        normalizedCondition.includes('cloud') || 
        normalizedCondition.includes('overcast')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-gray-400 ${className}`}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
      );
    }
    
    // Lluvia
    if (normalizedCondition.includes('lluv') || 
        normalizedCondition.includes('rain') || 
        normalizedCondition.includes('shower')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-blue-500 ${className}`}>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
          <path d="M16 14v6"></path>
          <path d="M8 14v6"></path>
          <path d="M12 16v6"></path>
        </svg>
      );
    }
    
    // Tormenta
    if (normalizedCondition.includes('torm') || 
        normalizedCondition.includes('thunder') || 
        normalizedCondition.includes('storm')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-purple-500 ${className}`}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
          <path d="M11.5 19L14 13H8L10.5 7"></path>
        </svg>
      );
    }
    
    // Nieve
    if (normalizedCondition.includes('niev') || 
        normalizedCondition.includes('snow')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-blue-200 ${className}`}>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
          <path d="M8 15h.01"></path>
          <path d="M8 19h.01"></path>
          <path d="M12 17h.01"></path>
          <path d="M12 21h.01"></path>
          <path d="M16 15h.01"></path>
          <path d="M16 19h.01"></path>
        </svg>
      );
    }
    
    // Niebla
    if (normalizedCondition.includes('nieb') || 
        normalizedCondition.includes('fog') || 
        normalizedCondition.includes('mist')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-gray-300 ${className}`}>
          <path d="M3 10h18"></path>
          <path d="M5 15h14"></path>
          <path d="M7 20h10"></path>
          <path d="M5 5h5"></path>
          <path d="M14 5h5"></path>
        </svg>
      );
    }
    
    // Icono por defecto
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClass} text-gray-500 ${className}`}>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
      </svg>
    );
  };
  
  return getIcon();
}
