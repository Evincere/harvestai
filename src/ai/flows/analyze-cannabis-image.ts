'use server';

/**
 * @fileOverview A cannabis image analysis AI agent using Google Cloud Vision API.
 *
 * - analyzeCannabisImage - A function that handles the image analysis process.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

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

const analyzeImage = ai.defineTool({
  name: 'analyzeImage',
  description: 'Analyzes an image of a cannabis plant to determine its ripeness level.',
  inputSchema: z.object({
    photoUrl: z.string().describe('The URL of the cannabis plant photo.'),
    description: z.string().optional().describe('Any additional information about the plant.'),
  }),
  outputSchema: z.object({
    ripenessLevel: z.string().describe('The ripeness level of the cannabis plant (e.g., Early, Mid, Late).'),
    confidence: z.number().describe('The confidence level of the ripeness analysis (0 to 1).'),
    additionalNotes: z.string().optional().describe('Any additional notes or observations from the analysis.'),
  }),
  async run(input) {
    // Mock analysis result (replace with actual AI analysis later)
    return {
      ripenessLevel: 'Mid',
      confidence: 0.75,
      additionalNotes: 'This is a simulated analysis using the AI tool.'
    };
  }
});

const analyzeCannabisImagePrompt = ai.definePrompt({
  name: 'analyzeCannabisImagePrompt',
  tools: [analyzeImage],
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
  prompt: `You are an expert cannabis plant analyst. Use the provided image and any available description to determine the ripeness level of the plant.
You have access to a tool called analyzeImage that can help you analyze the image. Please use it to get the ripeness level, confidence and any additional observations..
    
Description: {{{description}}}
Photo: {{media url=photoUrl}}
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
    const { output } = await analyzeCannabisImagePrompt(input);
    return output!;
  }
);
