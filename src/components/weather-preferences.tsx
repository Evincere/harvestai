'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OPTIMAL_CANNABIS_CONDITIONS } from '@/types/weather';

export interface WeatherPreferences {
  temperature_min: number;
  temperature_max: number;
  humidity_min: number;
  humidity_max: number;
  uv_index_min: number;
  uv_index_max: number;
  useCustomThresholds: boolean;
}

interface WeatherPreferencesProps {
  preferences: WeatherPreferences;
  onChange: (preferences: WeatherPreferences) => void;
  floweringStage: 'EARLY_FLOWERING' | 'MID_FLOWERING' | 'LATE_FLOWERING';
}

export function WeatherPreferences({ 
  preferences,
  onChange,
  floweringStage
}: WeatherPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState<WeatherPreferences>(preferences);
  
  // Obtener los valores predeterminados para la etapa de floración actual
  const defaultValues = OPTIMAL_CANNABIS_CONDITIONS[floweringStage];
  
  const handleChange = (key: keyof WeatherPreferences, value: number | boolean) => {
    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);
  };
  
  const applyChanges = () => {
    onChange(localPreferences);
  };
  
  const resetToDefaults = () => {
    const newPreferences = {
      ...localPreferences,
      temperature_min: defaultValues.temperature_min,
      temperature_max: defaultValues.temperature_max,
      humidity_min: defaultValues.humidity_min,
      humidity_max: defaultValues.humidity_max,
      uv_index_min: defaultValues.uv_index_min,
      uv_index_max: defaultValues.uv_index_max,
    };
    setLocalPreferences(newPreferences);
    onChange(newPreferences);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Personalizar Umbrales Climáticos</CardTitle>
        <CardDescription>
          Ajusta los rangos óptimos de temperatura, humedad y radiación UV según tus preferencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="custom-thresholds"
              checked={localPreferences.useCustomThresholds}
              onCheckedChange={(checked) => handleChange('useCustomThresholds', checked)}
            />
            <Label htmlFor="custom-thresholds">Usar umbrales personalizados</Label>
          </div>
          
          {localPreferences.useCustomThresholds && (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Temperatura (°C)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temp-min">Mínima: {localPreferences.temperature_min}°C</Label>
                      <Slider
                        id="temp-min"
                        min={10}
                        max={25}
                        step={1}
                        value={[localPreferences.temperature_min]}
                        onValueChange={(value) => handleChange('temperature_min', value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temp-max">Máxima: {localPreferences.temperature_max}°C</Label>
                      <Slider
                        id="temp-max"
                        min={20}
                        max={35}
                        step={1}
                        value={[localPreferences.temperature_max]}
                        onValueChange={(value) => handleChange('temperature_max', value[0])}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Humedad (%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="humidity-min">Mínima: {localPreferences.humidity_min}%</Label>
                      <Slider
                        id="humidity-min"
                        min={20}
                        max={60}
                        step={5}
                        value={[localPreferences.humidity_min]}
                        onValueChange={(value) => handleChange('humidity_min', value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="humidity-max">Máxima: {localPreferences.humidity_max}%</Label>
                      <Slider
                        id="humidity-max"
                        min={40}
                        max={80}
                        step={5}
                        value={[localPreferences.humidity_max]}
                        onValueChange={(value) => handleChange('humidity_max', value[0])}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Índice UV</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uv-min">Mínimo: {localPreferences.uv_index_min}</Label>
                      <Slider
                        id="uv-min"
                        min={0}
                        max={5}
                        step={1}
                        value={[localPreferences.uv_index_min]}
                        onValueChange={(value) => handleChange('uv_index_min', value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uv-max">Máximo: {localPreferences.uv_index_max}</Label>
                      <Slider
                        id="uv-max"
                        min={3}
                        max={10}
                        step={1}
                        value={[localPreferences.uv_index_max]}
                        onValueChange={(value) => handleChange('uv_index_max', value[0])}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetToDefaults}>
                    Restablecer valores predeterminados
                  </Button>
                  <Button onClick={applyChanges}>
                    Aplicar cambios
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-md text-sm">
                <h4 className="font-medium mb-1">Valores predeterminados para esta etapa:</h4>
                <ul className="space-y-1">
                  <li>Temperatura: {defaultValues.temperature_min}°C - {defaultValues.temperature_max}°C</li>
                  <li>Humedad: {defaultValues.humidity_min}% - {defaultValues.humidity_max}%</li>
                  <li>Índice UV: {defaultValues.uv_index_min} - {defaultValues.uv_index_max}</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
