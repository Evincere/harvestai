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

async function analyzeImageWithVisionAPI(photoUrl: string): Promise<AnalyzeCannabisImageOutput> {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_VISION_API_KEY is not set in environment variables.');
    }

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient({ keyFilename: apiKey });

    const [result] = await client.labelDetection(photoUrl);
    const labels = result.labelAnnotations;

    if (!labels || labels.length === 0) {
      throw new Error('No labels found in the image.');
    }

    // Filter labels related to cannabis and ripeness
    const relevantLabels = labels.filter(label =>
      label.description.toLowerCase().includes('cannabis') ||
      label.description.toLowerCase().includes('plant') ||
      label.description.toLowerCase().includes('leaf') ||
      label.description.toLowerCase().includes('ripeness') ||
      label.description.toLowerCase().includes('maturity')
    );

    if (relevantLabels.length === 0) {
      return {
        ripenessLevel: 'Unknown',
        confidence: 0.5,
        additionalNotes: 'Could not determine ripeness level. No relevant labels found.'
      };
    }

    // Determine ripeness level based on label descriptions (this is a simplified example)
    let ripenessLevel = 'Unknown';
    let confidence = 0.0;
    let additionalNotes = '';

    for (const label of relevantLabels) {
      const description = label.description.toLowerCase();
      confidence = Math.max(confidence, label.score || 0);

      if (description.includes('early')) {
        ripenessLevel = 'Early';
        additionalNotes = 'Early stage of ripeness.';
      } else if (description.includes('mid') || description.includes('medium')) {
        ripenessLevel = 'Mid';
        additionalNotes = 'Mid stage of ripeness.';
      } else if (description.includes('late') || description.includes('mature')) {
        ripenessLevel = 'Late';
        additionalNotes = 'Late stage of ripeness.';
      } else if (ripenessLevel === 'Unknown') {
        additionalNotes = 'General analysis of ripeness.';
        ripenessLevel = 'Mid';
      }
    }

    return {
      ripenessLevel: ripenessLevel,
      confidence: confidence,
      additionalNotes: additionalNotes || 'Successfully analyzed the image.'
    };

  } catch (error: any) {
    console.error('Error analyzing image with Vision API:', error);
    return {
      ripenessLevel: 'Unknown',
      confidence: 0.1,
      additionalNotes: `Error analyzing image: ${error.message || 'Unknown error'}`
    };
  }
}

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
  prompt: `You are an expert cannabis plant analyst. Analyze the provided image to determine the ripeness level of the plant.`,
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
    try {
      // Call Google Cloud Vision API to analyze the image
      const analysisResults = await analyzeImageWithVisionAPI(input.photoUrl);
      return analysisResults;
    } catch (error: any) {
      console.error('Error in analyzeCannabisImageFlow:', error);
      return {
        ripenessLevel: 'Unknown',
        confidence: 0.1,
        additionalNotes: `Failed to analyze image: ${error.message || 'Unknown error'}`
      };
    }
  }
);
