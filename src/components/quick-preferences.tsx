'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  CANNABIS_VARIETIES,
  CannabisVariety,
  HarvestPreference,
  UserPreferences
} from '@/types/cannabis';
import { VarietyHelper } from '@/components/variety-helper';

interface QuickPreferencesProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onMicroscopicToggle: (enabled: boolean) => void;
  className?: string;
}

export function QuickPreferences({
  preferences,
  onPreferencesChange,
  onMicroscopicToggle,
  className = ""
}: QuickPreferencesProps) {
  const selectedVariety = preferences.preferredVarieties[0] || '';

  const handleVarietyChange = (value: string) => {
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
    onMicroscopicToggle(checked);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="quick-variety">Variedad de Cannabis</Label>
          <VarietyHelper onVarietySelect={handleVarietyChange} />
        </div>
        <Select
          value={selectedVariety}
          onValueChange={handleVarietyChange}
        >
          <SelectTrigger id="quick-variety">
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
        {selectedVariety === 'unknown' && (
          <p className="text-xs text-muted-foreground mt-1">
            Se usarán valores promedio para el análisis. Para resultados más precisos, intenta identificar la variedad.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Preferencia de Efectos</Label>
        <RadioGroup
          value={preferences.harvestPreference}
          onValueChange={(value) => handlePreferenceChange(value as HarvestPreference)}
          className="flex flex-row space-x-4 justify-between"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Energético" id="quick-energetic" />
            <Label htmlFor="quick-energetic" className="font-normal">
              Energético
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Equilibrado" id="quick-balanced" />
            <Label htmlFor="quick-balanced" className="font-normal">
              Equilibrado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Relajante" id="quick-relaxing" />
            <Label htmlFor="quick-relaxing" className="font-normal">
              Relajante
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="quick-microscopic">Análisis Microscópico</Label>
          <p className="text-sm text-muted-foreground">
            Habilitar análisis de tricomas
          </p>
        </div>
        <Switch
          id="quick-microscopic"
          checked={preferences.useMicroscopicAnalysis}
          onCheckedChange={handleMicroscopicAnalysisChange}
        />
      </div>
    </div>
  );
}
