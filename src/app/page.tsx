
'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {getRipenessRecommendations} from '@/ai/flows/ripeness-recommendations';
import {Skeleton} from '@/components/ui/skeleton';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ripenessLevel, setRipenessLevel] = useState('');
  const [plantDescription, setPlantDescription] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis to determine ripeness level
      // In a real application, this would be replaced with an actual AI model
      const simulatedRipeness = 'Mid'; // Example: Early, Mid, Late
      setRipenessLevel(simulatedRipeness);

      const input = {
        ripenessLevel: simulatedRipeness,
        plantDescription: plantDescription,
      };

      const result = await getRipenessRecommendations(input);
      setRecommendations(result.recommendations);
      toast({
        title: 'Analysis Complete',
        description: 'Ripeness analysis and recommendations generated successfully.',
      });
    } catch (error: any) {
      console.error('Error during analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: error.message || 'Failed to analyze image and get recommendations. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-4 text-primary">HarvestAI</h1>
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
          <CardDescription>Upload an image of your cannabis plant to determine its ripeness and get recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            {image ? (
              <img src={image} alt="Cannabis Plant" className="max-h-64 rounded-md shadow-md" />
            ) : (
              <div className="border rounded-md p-4 w-full flex items-center justify-center bg-secondary/10">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Icons.plusCircle className="h-6 w-6 text-secondary" />
                  <span className="sr-only">Upload Image</span>
                </label>
              </div>
            )}
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button variant="secondary" asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                {image ? 'Change Image' : 'Upload Image'}
              </label>
            </Button>
          </div>
          <Textarea
            placeholder="Describe the plant (optional)"
            value={plantDescription}
            onChange={(e) => setPlantDescription(e.target.value)}
            className="resize-none"
          />
          <Button onClick={handleAnalyze} disabled={!image || loading}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </Button>
          {ripenessLevel && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-accent">Analysis Results</h2>
              <p>
                Predicted Harvest Time:{' '}
                <span className="font-bold">{loading ? <Skeleton className="h-4 w-24" /> : `Ready to harvest in 1 week (${ripenessLevel})`}</span>
              </p>
            </div>
          )}
          {recommendations.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-accent">Recommendations</h2>
              <ul className="list-disc pl-5 space-y-2">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-48" />
                  </>
                ) : (
                  recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
