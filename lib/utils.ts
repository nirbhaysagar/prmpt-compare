import { Variable, QualityMetrics, TokenUsage, PerformanceMetrics } from '@/types';

// Helper function to replace template variables in a prompt
// Example: prompt = "Summarize {{article_text}}"
// variables = [{ key: "article_text", value: "Long article..." }]
// Returns: "Summarize Long article..."
export function replaceVariables(prompt: string, variables: Variable[]): string {
  let result = prompt;
  variables.forEach(({ key, value }) => {
    // Replace {{variable_name}} with actual value
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

// Validate that all variables in a prompt are provided
// Example: prompt = "Summarize {{article_text}} and {{topic}}"
// variables = [{ key: "article_text", value: "..." }]
// Returns: false (missing "topic")
export function validatePrompt(prompt: string, variables: Variable[]): boolean {
  // Extract all {{variable}} patterns from prompt
  const variablePattern = /\{\{(\w+)\}\}/g;
  const matches = [...prompt.matchAll(variablePattern)];
  const requiredKeys = matches.map(m => m[1]);
  
  // Check if all required variables are provided
  const providedKeys = variables.map(v => v.key);
  return requiredKeys.every(key => providedKeys.includes(key));
}

// Generate a unique ID for sharing comparisons
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Format execution time for display (milliseconds to readable format)
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Calculate quality metrics for a response using AI-powered analysis
export async function calculateQualityMetrics(prompt: string, response: string, apiKey: string): Promise<QualityMetrics> {
  try {
    const analysisPrompt = `
Analyze the following AI response and rate it on a scale of 0-100 for each metric:

PROMPT: "${prompt}"
RESPONSE: "${response}"

Rate the response on:
1. Relevance (0-100): How well does the response address the prompt?
2. Coherence (0-100): How well-structured and logical is the response?
3. Completeness (0-100): How complete and thorough is the response?
4. Creativity (0-100): How original and creative is the response?

Respond in JSON format:
{
  "relevance": 85,
  "coherence": 90,
  "completeness": 80,
  "creativity": 75
}`;

    const response_analysis = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.1, // Low temperature for consistent scoring
        max_tokens: 200,
      }),
    });

    const analysisData = await response_analysis.json();
    const analysisText = analysisData.choices[0].message.content;
    
    // Parse the JSON response
    const metrics = JSON.parse(analysisText);
    
    // Calculate overall score as weighted average
    const overall = Math.round(
      (metrics.relevance * 0.3) +
      (metrics.coherence * 0.25) +
      (metrics.completeness * 0.25) +
      (metrics.creativity * 0.2)
    );

    return {
      relevance: metrics.relevance,
      coherence: metrics.coherence,
      completeness: metrics.completeness,
      creativity: metrics.creativity,
      overall,
    };
  } catch (error) {
    console.error('Quality analysis failed:', error);
    // Return default scores if analysis fails
    return {
      relevance: 75,
      coherence: 75,
      completeness: 75,
      creativity: 75,
      overall: 75,
    };
  }
}

// Calculate token usage and cost estimation
export function calculateTokenUsage(usage: any, model: string): TokenUsage {
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;

  // Cost per token (approximate rates as of 2024)
  const costRates: { [key: string]: { input: number; output: number } } = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  const rates = costRates[model] || costRates['gpt-4o-mini'];
  const estimatedCost = (promptTokens * rates.input + completionTokens * rates.output) / 1000;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost,
  };
}

// Calculate performance metrics
export function calculatePerformanceMetrics(
  executionTime: number,
  tokenUsage: TokenUsage,
  qualityMetrics: QualityMetrics
): PerformanceMetrics {
  const throughput = tokenUsage.totalTokens / (executionTime / 1000); // tokens per second
  const efficiency = qualityMetrics.overall / tokenUsage.totalTokens; // quality per token

  return {
    executionTime,
    throughput,
    efficiency,
  };
}

// Format cost for display
export function formatCost(cost: number): string {
  if (cost < 0.001) return `$${(cost * 1000).toFixed(3)}k`;
  return `$${cost.toFixed(4)}`;
}

// Format quality score with color coding
export function getQualityColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

// Format quality score with background color
export function getQualityBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100';
  if (score >= 80) return 'bg-blue-100';
  if (score >= 70) return 'bg-yellow-100';
  if (score >= 60) return 'bg-orange-100';
  return 'bg-red-100';
}
