'use server';

/**
 * @fileOverview Proporciona recomendaciones para optimizar el crecimiento de la planta de cannabis basándose en el análisis de madurez.
 *
 * - obtenerRecomendacionesDeMadurez - Una función que proporciona recomendaciones de madurez.
 * - EntradaRecomendacionesDeMadurez - El tipo de entrada para la función obtenerRecomendacionesDeMadurez.
 * - SalidaRecomendacionesDeMadurez - El tipo de retorno para la función obtenerRecomendacionesDeMadurez.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RipenessRecommendationsInputSchema = z.object({
  ripenessLevel: z.string().describe('El nivel de madurez de la planta de cannabis (p. ej., temprano, medio, tardío).'),
  plantDescription: z.string().describe('Una descripción de la planta de cannabis, incluyendo cualquier problema u observación.'),
});
export type RipenessRecommendationsInput = z.infer<typeof RipenessRecommendationsInputSchema>;

const RipenessRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('Una lista de recomendaciones para optimizar el crecimiento de la planta de cannabis.')
  ).
describe('Las recomendaciones basadas en el nivel de madurez y la descripción de la planta.'),
});
export type RipenessRecommendationsOutput = z.infer<typeof RipenessRecommendationsOutputSchema>;

export async function getRipenessRecommendations(input: RipenessRecommendationsInput): Promise<RipenessRecommendationsOutput> {
  return ripenessRecommendationsFlow(input);
}

const ripenessRecommendationsPrompt = ai.definePrompt({
  name: 'ripenessRecommendationsPrompt',
  input: {
    schema: z.object({
      ripenessLevel: z.string().describe('El nivel de madurez de la planta de cannabis.'),
      plantDescription: z.string().describe('Una descripción de la planta de cannabis.'),
    }),
  },
  output: {
    schema: z.object({
      recommendations: z.array(
        z.string().describe('Una lista de recomendaciones para optimizar el crecimiento de la planta de cannabis.')
      ).
describe('Las recomendaciones basadas en el nivel de madurez y la descripción de la planta.'),
    }),
  },
  prompt: `Eres un experto cultivador de cannabis que proporciona consejos a los cultivadores.

  Basándote en el nivel de madurez y la descripción de la planta, proporciona recomendaciones personalizadas para optimizar las condiciones de crecimiento y maximizar el rendimiento.

  Nivel de Madurez: {{{ripenessLevel}}}
  Descripción de la Planta: {{{plantDescription}}}

  Recomendaciones:
  `,
});

const ripenessRecommendationsFlow = ai.defineFlow<
  typeof RipenessRecommendationsInputSchema,
  typeof RipenessRecommendationsOutputSchema
>(
  {
    name: 'ripenessRecommendationsFlow',
    inputSchema: RipenessRecommendationsInputSchema,
    outputSchema: RipenessRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await ripenessRecommendationsPrompt(input);
    return output!;
  }
);
