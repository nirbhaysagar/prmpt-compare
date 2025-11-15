// Define the data structures we'll use throughout the app

export interface PromptVariation {
  id: string;           // Unique ID for each prompt
  content: string;      // The actual prompt text
  name?: string;        // Optional display name
}

export interface Variable {
  key: string;         // Variable name like "article_text"
  value: string;       // The actual value to substitute
}

export interface QualityMetrics {
  relevance: number;      // 0-100: How relevant is the response to the prompt
  coherence: number;      // 0-100: How coherent and well-structured is the response
  completeness: number;  // 0-100: How complete is the response
  creativity: number;     // 0-100: How creative/original is the response
  overall: number;        // 0-100: Overall quality score
}

export interface TokenUsage {
  promptTokens: number;    // Tokens used in the input prompt
  completionTokens: number; // Tokens generated in the response
  totalTokens: number;     // Total tokens used
  estimatedCost: number;   // Estimated cost in USD
}

export interface PerformanceMetrics {
  executionTime: number;   // Response time in milliseconds
  throughput: number;      // Tokens per second
  efficiency: number;       // Quality score per token used
}

export interface PromptResult {
  promptId: string;           // Which prompt was used
  model: string;              // Which LLM was used
  output: string;             // The AI's response
  executionTime?: number;     // How long it took (ms)
  qualityMetrics?: QualityMetrics; // AI-powered quality assessment
  tokenUsage?: TokenUsage;    // Token consumption details
  performanceMetrics?: PerformanceMetrics; // Performance analysis
}

export interface ComparisonData {
  id: string;
  variables: Variable[];
  promptVariations: PromptVariation[];
  results: PromptResult[];
  createdAt: Date;
  summary?: {
    bestPrompt: string;        // ID of the highest scoring prompt
    averageQuality: number;    // Average quality across all prompts
    totalCost: number;        // Total cost of this comparison
    totalTokens: number;      // Total tokens used
  };
}
