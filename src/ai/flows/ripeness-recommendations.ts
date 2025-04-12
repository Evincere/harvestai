'use server';

/**
 * @fileOverview Provides recommendations for optimizing cannabis plant growth based on ripeness analysis.
 *
 * - getRipenessRecommendations - A function that provides ripeness recommendations.
 * - RipenessRecommendationsInput - The input type for the getRipenessRecommendations function.
 * - RipenessRecommendationsOutput - The return type for the getRipenessRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RipenessRecommendationsInputSchema = z.object({
  ripenessLevel: z.string().describe('The ripeness level of the cannabis plant (e.g., early, mid, late).'),
  plantDescription: z.string().describe('A description of the cannabis plant, including any issues or observations.'),
});
export type RipenessRecommendationsInput = z.infer<typeof RipenessRecommendationsInputSchema>;

const RipenessRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('A list of recommendations for optimizing the cannabis plant growth.')
  ).
describe('The recommendations based on the ripeness level and plant description.'),
});
export type RipenessRecommendationsOutput = z.infer<typeof RipenessRecommendationsOutputSchema>;

export async function getRipenessRecommendations(input: RipenessRecommendationsInput): Promise<RipenessRecommendationsOutput> {
  return ripenessRecommendationsFlow(input);
}

const ripenessRecommendationsPrompt = ai.definePrompt({
  name: 'ripenessRecommendationsPrompt',
  input: {
    schema: z.object({
      ripenessLevel: z.string().describe('The ripeness level of the cannabis plant.'),
      plantDescription: z.string().describe('A description of the cannabis plant.'),
    }),
  },
  output: {
    schema: z.object({
      recommendations: z.array(
        z.string().describe('A list of recommendations for optimizing the cannabis plant growth.')
      ).
describe('The recommendations based on the ripeness level and plant description.'),
    }),
  },
  prompt: `You are an expert cannabis cultivator providing advice to growers.

  Based on the ripeness level and description of the plant, provide tailored recommendations to optimize growth conditions and maximize yield.

  Ripeness Level: {{{ripenessLevel}}}
  Plant Description: {{{plantDescription}}}

  Recommendations:
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
