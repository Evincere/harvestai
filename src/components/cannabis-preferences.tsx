'use client';

import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  CANNABIS_VARIETIES, 
  CannabisVariety, 
  HarvestPreference, 
  UserPreferences, 
  DEFAULT_PREFERENCES 
} from '@/types/cannabis';

interface CannabisPreferencesProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

export function CannabisPreferences({ 
  preferences, 
  onPreferencesChange 
}: CannabisPreferencesProps) {
  const [selectedVariety, setSelectedVariety] = useState<string>(
    preferences.preferredVarieties[0] || ''
  );

  const handleVarietyChange = (value: string) => {
    setSelectedVariety(value);
    onPreferencesChange({
      ...preferences,
      preferredVarieties: [value]
    });
  };

  const handlePreferenceChange = (value: HarvestPreference) => {
    onPreferencesChange({
      ...preferences,
      harvestPreference: value
    });
  };

  const handleMicroscopicAnalysisChange = (checked: boolean) => {
    onPreferencesChange({
      ...preferences,
      useMicroscopicAnalysis: checked
    });
  };

  // Encontrar la variedad seleccionada para mostrar su descripción
  const selectedVarietyDetails = CANNABIS_VARIETIES.find(
    v => v.id === selectedVariety
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Preferencias de Análisis</CardTitle>
        <CardDescription>
          Personaliza el análisis según tus preferencias y la variedad que cultivas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de variedad */}
        <div className="space-y-2">
          <Label htmlFor="variety">Variedad de Cannabis</Label>
          <Select 
            value={selectedVariety} 
            onValueChange={handleVarietyChange}
          >
            <SelectTrigger id="variety">
              <SelectValue placeholder="Selecciona una variedad" />
            </SelectTrigger>
            <SelectContent>
              {CANNABIS_VARIETIES.map((variety) => (
                <SelectItem key={variety.id} value={variety.id}>
                  {variety.name} ({variety.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedVarietyDetails && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedVarietyDetails.description} 
              <br />
              Tiempo de floración: {selectedVarietyDetails.floweringTime.min}-{selectedVarietyDetails.floweringTime.max} días
            </p>
          )}
        </div>

        {/* Preferencia de cosecha */}
        <div className="space-y-2">
          <Label>Preferencia de Efectos</Label>
          <RadioGroup 
            value={preferences.harvestPreference} 
            onValueChange={(value) => handlePreferenceChange(value as HarvestPreference)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Energético" id="energetic" />
              <Label htmlFor="energetic" className="font-normal">
                Energético (cosecha temprana)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Equilibrado" id="balanced" />
              <Label htmlFor="balanced" className="font-normal">
                Equilibrado (punto óptimo)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Relajante" id="relaxing" />
              <Label htmlFor="relaxing" className="font-normal">
                Relajante (cosecha tardía)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Opción de análisis microscópico */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="microscopic">Análisis Microscópico</Label>
            <p className="text-sm text-muted-foreground">
              Habilitar análisis de imágenes de tricomas
            </p>
          </div>
          <Switch
            id="microscopic"
            checked={preferences.useMicroscopicAnalysis}
            onCheckedChange={handleMicroscopicAnalysisChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
