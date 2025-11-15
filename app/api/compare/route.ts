import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  replaceVariables, 
  generateId, 
  calculateQualityMetrics, 
  calculateTokenUsage, 
  calculatePerformanceMetrics 
} from '@/lib/utils';
import { PromptVariation, Variable } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get the request body (prompts and variables from frontend)
    const { prompts, variables }: { prompts: PromptVariation[]; variables: Variable[] } = await request.json();
    
    // Get API key from request header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Initialize OpenAI client with user's API key
    const openai = new OpenAI({ apiKey });

    // Run each prompt through OpenAI and collect results with enhanced analytics
    const results = await Promise.all(
      prompts.map(async (prompt) => {
        const startTime = Date.now(); // Track execution time
        
        // Replace template variables in prompt (e.g., {{name}} -> "John")
        const finalPrompt = replaceVariables(prompt.content, variables);

        // Call OpenAI API with the final prompt
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Using cheaper model for MVP
          messages: [{ role: 'user', content: finalPrompt }],
          temperature: 0.7, // Controls randomness (0 = deterministic, 1 = creative)
        });

        const executionTime = Date.now() - startTime;
        const response = completion.choices[0].message.content || '';

        // Calculate enhanced analytics
        const tokenUsage = calculateTokenUsage(completion.usage, 'gpt-4o-mini');
        const qualityMetrics = await calculateQualityMetrics(finalPrompt, response, apiKey);
        const performanceMetrics = calculatePerformanceMetrics(executionTime, tokenUsage, qualityMetrics);

        return {
          promptId: prompt.id,
          promptName: prompt.name,
          model: 'gpt-4o-mini',
          output: response,
          timestamp: new Date(),
          executionTime,
          qualityMetrics,
          tokenUsage,
          performanceMetrics,
        };
      })
    );

    // Calculate summary statistics
    const totalCost = results.reduce((sum, result) => sum + (result.tokenUsage?.estimatedCost || 0), 0);
    const totalTokens = results.reduce((sum, result) => sum + (result.tokenUsage?.totalTokens || 0), 0);
    const averageQuality = results.reduce((sum, result) => sum + (result.qualityMetrics?.overall || 0), 0) / results.length;
    const bestPrompt = results.reduce((best, current) => 
      (current.qualityMetrics?.overall || 0) > (best.qualityMetrics?.overall || 0) ? current : best
    );

    // Return the comparison results with enhanced analytics
    return NextResponse.json({
      id: generateId(),
      variables,
      promptVariations: prompts,
      results,
      createdAt: new Date(),
      summary: {
        bestPrompt: bestPrompt.promptId,
        averageQuality: Math.round(averageQuality),
        totalCost,
        totalTokens,
      },
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to run comparison. Check your API key and try again.' },
      { status: 500 }
    );
  }
}
