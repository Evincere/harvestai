'use server';

/**
 * @fileOverview A cannabis image analysis AI agent.
 *
 * - analyzeCannabisImage - A function that handles the image analysis process.
 * - AnalyzeCannabisImageInput - The input type for the analyzeCannabisImage function.
 * - AnalyzeCannabisImageOutput - The return type for the analyzeCannabisImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeCannabisImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the cannabis plant photo.'),
  description: z.string().describe('The description of the cannabis plant (optional).'),
});
export type AnalyzeCannabisImageInput = z.infer<typeof AnalyzeCannabisImageInputSchema>;

const AnalyzeCannabisImageOutputSchema = z.object({
  ripenessLevel: z.string().describe('The ripeness level of the cannabis plant (e.g., Early, Mid, Late).'),
  confidence: z.number().describe('The confidence level of the ripeness analysis (0 to 1).'),
  additionalNotes: z.string().optional().describe('Any additional notes or observations from the analysis.'),
});
export type AnalyzeCannabisImageOutput = z.infer<typeof AnalyzeCannabisImageOutputSchema>;

export async function analyzeCannabisImage(input: AnalyzeCannabisImageInput): Promise<AnalyzeCannabisImageOutput> {
  return analyzeCannabisImageFlow(input);
}

const imageAnalysisTool = ai.defineTool({
  name: 'analyzeCannabisPlantRipeness',
  description: 'Analyzes a cannabis plant image to determine its ripeness level.',
  inputSchema: z.object({
    photoUrl: z.string().describe('The URL of the cannabis plant photo.'),
    description: z.string().describe('The description of the cannabis plant (optional).'),
  }),
  outputSchema: z.object({
    ripenessLevel: z.string().describe('The ripeness level of the cannabis plant (e.g., Early, Mid, Late).'),
    confidence: z.number().describe('The confidence level of the ripeness analysis (0 to 1).'),
    additionalNotes: z.string().optional().describe('Any additional notes or observations from the analysis.'),
  }),
  async fn(input) {
    // Simulated AI analysis - replace with actual image analysis logic
    // This is just a placeholder, replace with an actual AI model call
    const ripenessLevels = ['Early', 'Mid', 'Late'];
    const randomIndex = Math.floor(Math.random() * ripenessLevels.length);
    const ripenessLevel = ripenessLevels[randomIndex];
    const confidence = Math.random();
    const additionalNotes = 'This is a simulated analysis. Please replace with actual AI model.';

    return {
      ripenessLevel,
      confidence,
      additionalNotes,
    };
  },
});

const analyzeCannabisImagePrompt = ai.definePrompt({
  name: 'analyzeCannabisImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the cannabis plant photo.'),
      description: z.string().describe('The description of the cannabis plant (optional).'),
    }),
  },
  output: {
    schema: z.object({
      ripenessLevel: z.string().describe('The ripeness level of the cannabis plant (e.g., Early, Mid, Late).'),
      confidence: z.number().describe('The confidence level of the ripeness analysis (0 to 1).'),
      additionalNotes: z.string().optional().describe('Any additional notes or observations from the analysis.'),
    }),
  },
  tools: [imageAnalysisTool],
  prompt: `You are an expert cannabis plant analyst. 
  Analyze the provided image and description to determine the ripeness level of the plant.
  
  Image URL: {{photoUrl}}
  Description: {{description}}
  
  Use the analyzeCannabisPlantRipeness tool to perform the analysis.
  `,
});

const analyzeCannabisImageFlow = ai.defineFlow<
  typeof AnalyzeCannabisImageInputSchema,
  typeof AnalyzeCannabisImageOutputSchema
>(
  {
    name: 'analyzeCannabisImageFlow',
    inputSchema: AnalyzeCannabisImageInputSchema,
    outputSchema: AnalyzeCannabisImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeCannabisImagePrompt(input);
    return output!;
  }
);
