'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CannabisVariety } from "@/types/cannabis";

interface ClimateConditionsProps {
  variety?: CannabisVariety;
}

export function ClimateConditions({ variety }: ClimateConditionsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Condiciones Climáticas Óptimas</CardTitle>
        <CardDescription>
          Factores ambientales que influyen en la maduración del cannabis
          {variety && ` - Recomendaciones para ${variety.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="temperature">
            <AccordionTrigger>Temperatura</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <h4 className="font-medium">Rangos ideales:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">Etapa de plántula:</span> 22–27°C (71–80°F)</li>
                  <li><span className="font-semibold">Vegetación:</span> 24–27°C (75–80°F)</li>
                  <li><span className="font-semibold">Floración:</span> 18–26°C (64–79°F)</li>
                  <li><span className="font-semibold">Temperaturas nocturnas:</span> 17–20°C (62–68°F)</li>
                </ul>
                
                <h4 className="font-medium mt-3">Riesgos:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">Calor excesivo (>30°C):</span> Reduce la fotosíntesis, atrae plagas como ácaros y favorece el mildiu polvoriento.</li>
                  <li><span className="font-semibold">Frío extremo (&lt;15°C):</span> Ralentiza el crecimiento, induce hermafroditismo y aumenta el riesgo de moho en raíces y cogollos.</li>
                </ul>
                
                {variety && variety.type === 'Indica' && (
                  <div className="mt-3 p-2 bg-secondary/20 rounded-md">
                    <p className="text-sm"><span className="font-semibold">Nota para variedades Indica:</span> Las temperaturas más bajas durante la floración tardía (15-18°C) pueden estimular la producción de pigmentos púrpura, mejorando la apariencia y potencialmente el perfil de terpenos.</p>
                  </div>
                )}
                
                {variety && variety.type === 'Sativa' && (
                  <div className="mt-3 p-2 bg-secondary/20 rounded-md">
                    <p className="text-sm"><span className="font-semibold">Nota para variedades Sativa:</span> Toleran mejor temperaturas más altas. Mantener entre 24-28°C durante la floración puede optimizar la producción de resina sin comprometer el desarrollo de los cogollos.</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="humidity">
            <AccordionTrigger>Humedad Relativa</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <h4 className="font-medium">Etapas clave:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">Germinación y plántula:</span> HR del 65–80% para facilitar la absorción de agua a través de las hojas.</li>
                  <li><span className="font-semibold">Vegetación:</span> HR del 50–70% para promover un crecimiento vigoroso.</li>
                  <li><span className="font-semibold">Floración temprana:</span> HR del 40–60% para equilibrar el desarrollo de cogollos.</li>
                  <li><span className="font-semibold">Floración tardía:</span> HR del 40–50% para prevenir podredumbre de cogollos (Botrytis cinerea) y mildiu.</li>
                </ul>
                
                <h4 className="font-medium mt-3">Consecuencias de un control deficiente:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">Alta humedad en floración:</span> Desarrollo de moho gris y pérdida de hasta el 50% de la cosecha.</li>
                  <li><span className="font-semibold">Baja humedad:</span> Quema de nutrientes y estrés hídrico, visible en hojas amarillas y puntas secas.</li>
                </ul>
                
                {variety && (
                  <div className="mt-3 p-2 bg-secondary/20 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Recomendación para {variety.name}:</span> {
                        variety.type === 'Indica' 
                          ? 'Las variedades Indica suelen tener cogollos más densos, lo que aumenta el riesgo de moho. Mantén la HR por debajo del 45% durante las últimas 2-3 semanas de floración.' 
                          : variety.type === 'Sativa'
                            ? 'Las variedades Sativa suelen tener cogollos más abiertos y aireados. Aun así, mantén la HR por debajo del 50% durante la floración tardía para maximizar la producción de resina.'
                            : 'Para híbridos, monitorea de cerca la densidad de los cogollos. Ajusta la HR según la estructura: más baja (40-45%) para cogollos densos, ligeramente más alta (45-50%) para cogollos más abiertos.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="light">
            <AccordionTrigger>Luz</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <h4 className="font-medium">Parámetros importantes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">Intensidad:</span> 600-1000 μmol/m²/s PPFD para floración óptima.</li>
                  <li><span className="font-semibold">Ciclo en floración:</span> 12 horas de luz / 12 horas de oscuridad.</li>
                  <li><span className="font-semibold">Espectro:</span> Luz azul para vegetación, luz roja para floración.</li>
                </ul>
                
                <h4 className="font-medium mt-3">Efectos en la maduración:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Mayor intensidad lumínica durante la floración aumenta la producción de tricomas y cannabinoides.</li>
                  <li>La luz UV-B moderada puede incrementar la producción de THC como mecanismo de defensa de la planta.</li>
                  <li>Periodos de oscuridad ininterrumpida son cruciales para la síntesis de florigen y el desarrollo adecuado de los cogollos.</li>
                </ul>
                
                {variety && (
                  <div className="mt-3 p-2 bg-secondary/20 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Recomendación para {variety.name}:</span> {
                        variety.type === 'Indica' 
                          ? 'Las variedades Indica suelen beneficiarse de una mayor proporción de luz roja durante la floración. Considera usar luces con espectro enriquecido en rojo (2700-3000K) para maximizar la densidad de los cogollos.' 
                          : variety.type === 'Sativa'
                            ? 'Las variedades Sativa tienen periodos de floración más largos. Mantén una intensidad lumínica alta y constante durante todo el periodo para evitar el estiramiento excesivo y promover la formación de cogollos compactos.'
                            : 'Para híbridos, un espectro equilibrado con buena representación tanto de luz azul como roja (3500-4000K) suele dar los mejores resultados en términos de rendimiento y potencia.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="airflow">
            <AccordionTrigger>Flujo de Aire</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <h4 className="font-medium">Beneficios de una buena circulación:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Fortalece los tallos y ramas, mejorando el soporte para cogollos pesados.</li>
                  <li>Previene microclimas húmedos que favorecen el desarrollo de moho y hongos.</li>
                  <li>Facilita el intercambio de CO₂, esencial para la fotosíntesis y el crecimiento.</li>
                  <li>Ayuda a mantener temperaturas uniformes en todo el dosel de la planta.</li>
                </ul>
                
                <h4 className="font-medium mt-3">Recomendaciones:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Velocidad del aire: suficiente para crear un movimiento suave pero constante de las hojas.</li>
                  <li>Evitar corrientes directas y fuertes sobre las plantas, especialmente durante la floración.</li>
                  <li>Asegurar que el aire circule también por la parte inferior del dosel para prevenir problemas de humedad.</li>
                </ul>
                
                {variety && (
                  <div className="mt-3 p-2 bg-secondary/20 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Recomendación para {variety.name}:</span> {
                        variety.type === 'Indica' 
                          ? 'Las variedades Indica suelen tener una estructura más compacta y densa, lo que puede dificultar la circulación de aire entre las ramas. Considera técnicas de defoliación selectiva para mejorar el flujo de aire interno.' 
                          : variety.type === 'Sativa'
                            ? 'Las variedades Sativa tienden a crecer más altas y abiertas. Asegúrate de que el flujo de aire llegue a todas las partes de la planta, especialmente en cultivos en interior donde pueden acercarse demasiado a las luces.'
                            : 'Para híbridos, observa la estructura específica de la planta y ajusta el flujo de aire según sea necesario. Presta especial atención a las zonas centrales donde los cogollos pueden ser más densos.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
