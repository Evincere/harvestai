'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CANNABIS_VARIETIES, CannabisType, CannabisVariety } from '@/types/cannabis';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Leaf, X } from 'lucide-react';

interface VarietyHelperProps {
  onVarietySelect: (varietyId: string) => void;
}

export function VarietyHelper({ onVarietySelect }: VarietyHelperProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CannabisType | null>(null);
  const [selectedGrowthSpeed, setSelectedGrowthSpeed] = useState<'rápido' | 'medio' | 'lento' | null>(null);
  const [suggestedVarieties, setSuggestedVarieties] = useState<CannabisVariety[]>([]);

  const handleTypeSelect = (type: CannabisType) => {
    setSelectedType(type);
    updateSuggestions(type, selectedGrowthSpeed);
  };

  const handleGrowthSpeedSelect = (speed: 'rápido' | 'medio' | 'lento') => {
    setSelectedGrowthSpeed(speed);
    updateSuggestions(selectedType, speed);
  };

  const updateSuggestions = (type: CannabisType | null, speed: 'rápido' | 'medio' | 'lento' | null) => {
    if (!type && !speed) {
      setSuggestedVarieties([]);
      return;
    }

    let filtered = [...CANNABIS_VARIETIES];

    // Filtrar por tipo si está seleccionado
    if (type) {
      filtered = filtered.filter(v => v.type === type);
    }

    // Filtrar por velocidad de crecimiento si está seleccionada
    if (speed) {
      filtered = filtered.filter(v => {
        const avgFloweringTime = (v.floweringTime.min + v.floweringTime.max) / 2;
        
        if (speed === 'rápido' && avgFloweringTime < 60) return true;
        if (speed === 'medio' && avgFloweringTime >= 60 && avgFloweringTime <= 75) return true;
        if (speed === 'lento' && avgFloweringTime > 75) return true;
        
        return false;
      });
    }

    // Excluir la variedad "Desconocida/Otra" de las sugerencias
    filtered = filtered.filter(v => v.id !== 'unknown');

    // Limitar a 3 sugerencias
    setSuggestedVarieties(filtered.slice(0, 3));
  };

  const handleVarietySelect = (varietyId: string) => {
    onVarietySelect(varietyId);
    setOpen(false);
  };

  const resetSelections = () => {
    setSelectedType(null);
    setSelectedGrowthSpeed(null);
    setSuggestedVarieties([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ayuda para identificar variedad</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ayuda para Identificar Variedad</DialogTitle>
          <DialogDescription>
            Responde algunas preguntas para ayudarte a identificar el tipo de variedad que podría ser tu planta.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Preguntas</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">¿Qué tipo de planta crees que es?</h3>
                <RadioGroup 
                  value={selectedType || ''} 
                  onValueChange={(value) => handleTypeSelect(value as CannabisType)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sativa" id="sativa" />
                    <Label htmlFor="sativa" className="font-normal">
                      Sativa (hojas delgadas, planta alta)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Indica" id="indica" />
                    <Label htmlFor="indica" className="font-normal">
                      Indica (hojas anchas, planta compacta)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Híbrido" id="hybrid" />
                    <Label htmlFor="hybrid" className="font-normal">
                      Híbrido (características mixtas)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">¿Cuánto tiempo lleva en floración?</h3>
                <RadioGroup 
                  value={selectedGrowthSpeed || ''} 
                  onValueChange={(value) => handleGrowthSpeedSelect(value as 'rápido' | 'medio' | 'lento')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rápido" id="fast" />
                    <Label htmlFor="fast" className="font-normal">
                      Floración rápida (menos de 60 días)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medio" id="medium" />
                    <Label htmlFor="medium" className="font-normal">
                      Floración media (60-75 días)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lento" id="slow" />
                    <Label htmlFor="slow" className="font-normal">
                      Floración lenta (más de 75 días)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {suggestedVarieties.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Posibles variedades:</h3>
                <div className="grid gap-2">
                  {suggestedVarieties.map((variety) => (
                    <Card key={variety.id} className="p-0 overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{variety.name}</h4>
                            <p className="text-xs text-muted-foreground">{variety.type} - Floración: {variety.floweringTime.min}-{variety.floweringTime.max} días</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleVarietySelect(variety.id)}
                          >
                            Seleccionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={resetSelections}>
                Reiniciar
              </Button>
              <Button 
                onClick={() => handleVarietySelect('unknown')}
                variant="secondary"
              >
                Usar valores genéricos
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Identificación visual:</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-base">Sativa</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Hojas delgadas y alargadas</li>
                      <li>Planta alta y esbelta</li>
                      <li>Cogollos más sueltos y ligeros</li>
                      <li>Floración más larga (70-90 días)</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleTypeSelect('Sativa')}
                    >
                      <Leaf className="mr-2 h-4 w-4" />
                      Es Sativa
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-base">Indica</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Hojas anchas y cortas</li>
                      <li>Planta baja y compacta</li>
                      <li>Cogollos densos y pesados</li>
                      <li>Floración más rápida (45-60 días)</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleTypeSelect('Indica')}
                    >
                      <Leaf className="mr-2 h-4 w-4" />
                      Es Indica
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base">Híbrido</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-xs">Los híbridos combinan características de ambos tipos. Si tu planta muestra una mezcla de características o no estás seguro, probablemente sea un híbrido.</p>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleTypeSelect('Híbrido')}
                  >
                    <Leaf className="mr-2 h-4 w-4" />
                    Es Híbrido
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" onClick={resetSelections}>
                  Reiniciar
                </Button>
                <Button 
                  onClick={() => handleVarietySelect('unknown')}
                  variant="secondary"
                >
                  Usar valores genéricos
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
