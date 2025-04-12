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
    try {
      const response = await ai.generate({
        model: 'googleai/gemini-pro-vision',
        prompt: `You are an expert cannabis plant analyst. Use the provided image to determine the ripeness level of the plant. Consider the ripeness level as Early, Mid or Late. The confidence is a number from 0 to 1.  Use the image to get the ripeness level, confidence and any additional observations. Please answer in json format with the keys "ripenessLevel", "confidence" and "additionalNotes".`,
        media: [{ url: input.photoUrl }],
      });
      console.log(response); // Log the entire response
      const parsedResponse = JSON.parse(response);
      if (typeof parsedResponse.confidence !== 'number') {
        throw new Error('Could not parse confidence value from AI response.');
      }
      return { ripenessLevel: parsedResponse.ripenessLevel, confidence: parsedResponse.confidence, additionalNotes: parsedResponse.additionalNotes };
    } catch (error) {
      console.error('Error during AI analysis:', error);
      return { ripenessLevel: 'Unknown', confidence: 0, additionalNotes: 'Error parsing AI response' };
    }
  },
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
  prompt: `You are an expert cannabis plant analyst.  
    You have access to a tool called analyzeImage that can help you analyze the image. Please use it to get the ripeness level, confidence and any additional observations.

    The user has provided the following description of the plant, use it to enhance the analysis:  {{{description}}}

    Analyze the image provided.
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
  async (input) => {
    const output = await analyzeCannabisImagePrompt(input);
    return output ?? { ripenessLevel: 'Unknown', confidence: 0, additionalNotes: 'Error parsing AI response' };
  }
);
