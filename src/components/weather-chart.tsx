'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastWeather } from '@/types/weather';

interface WeatherChartProps {
  forecast: ForecastWeather[];
  title?: string;
  description?: string;
}

export function WeatherChart({ 
  forecast,
  title = "Pronóstico Climático",
  description = "Evolución de temperatura y humedad en los próximos días"
}: WeatherChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !forecast || forecast.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Configuración del gráfico
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Obtener datos para el gráfico
    const days = forecast.slice(0, 7).map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    });
    
    const tempMax = forecast.slice(0, 7).map(day => day.temperature_max);
    const tempMin = forecast.slice(0, 7).map(day => day.temperature_min);
    const humidity = forecast.slice(0, 7).map(day => day.humidity);
    
    // Encontrar valores máximos y mínimos para escalar el gráfico
    const maxTemp = Math.max(...tempMax) + 5;
    const minTemp = Math.min(...tempMin) - 5;
    const tempRange = maxTemp - minTemp;
    
    // Dibujar ejes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Eje Y (temperatura)
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    
    // Eje X (días)
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Etiquetas de ejes
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    // Etiquetas de temperatura (eje Y)
    const tempSteps = 5;
    for (let i = 0; i <= tempSteps; i++) {
      const temp = minTemp + (tempRange * (i / tempSteps));
      const y = height - padding - (chartHeight * (i / tempSteps));
      
      ctx.fillText(`${temp.toFixed(0)}°C`, padding - 5, y + 3);
      
      // Líneas de cuadrícula horizontales
      ctx.beginPath();
      ctx.strokeStyle = '#ddd';
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Etiquetas de días (eje X)
    ctx.textAlign = 'center';
    const dayWidth = chartWidth / (days.length - 1);
    days.forEach((day, i) => {
      const x = padding + (dayWidth * i);
      ctx.fillText(day, x, height - padding + 15);
      
      // Líneas de cuadrícula verticales
      ctx.beginPath();
      ctx.strokeStyle = '#ddd';
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    });
    
    // Dibujar línea de temperatura máxima
    ctx.beginPath();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    tempMax.forEach((temp, i) => {
      const x = padding + (dayWidth * i);
      const y = height - padding - ((temp - minTemp) / tempRange * chartHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Dibujar línea de temperatura mínima
    ctx.beginPath();
    ctx.strokeStyle = '#339af0';
    ctx.lineWidth = 2;
    tempMin.forEach((temp, i) => {
      const x = padding + (dayWidth * i);
      const y = height - padding - ((temp - minTemp) / tempRange * chartHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Dibujar línea de humedad (escala secundaria)
    ctx.beginPath();
    ctx.strokeStyle = '#20c997';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    humidity.forEach((hum, i) => {
      const x = padding + (dayWidth * i);
      // Escalar la humedad de 0-100% al rango de altura del gráfico
      const y = height - padding - (hum / 100 * chartHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Leyenda
    const legendY = padding / 2;
    
    // Temperatura máxima
    ctx.beginPath();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.moveTo(padding, legendY);
    ctx.lineTo(padding + 20, legendY);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.textAlign = 'left';
    ctx.fillText('Temp. Máx', padding + 25, legendY + 3);
    
    // Temperatura mínima
    ctx.beginPath();
    ctx.strokeStyle = '#339af0';
    ctx.lineWidth = 2;
    ctx.moveTo(padding + 100, legendY);
    ctx.lineTo(padding + 120, legendY);
    ctx.stroke();
    ctx.fillText('Temp. Mín', padding + 125, legendY + 3);
    
    // Humedad
    ctx.beginPath();
    ctx.strokeStyle = '#20c997';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.moveTo(padding + 200, legendY);
    ctx.lineTo(padding + 220, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('Humedad', padding + 225, legendY + 3);
    
  }, [forecast]);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64 relative">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={300}
            className="w-full h-full"
          />
        </div>
        <div className="mt-4 grid grid-cols-3 md:grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
          {forecast.slice(0, 7).map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="font-medium">
                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className="text-sm">
                {day.temperature_max.toFixed(1)}° / {day.temperature_min.toFixed(1)}°
              </span>
              <span>{day.humidity}% HR</span>
              {day.precipitation_probability > 0 && (
                <span>{day.precipitation_probability}% lluvia</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
