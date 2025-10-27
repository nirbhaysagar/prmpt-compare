import fs from 'fs/promises';
import path from 'path';
import { ComparisonData } from '@/types';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'comparisons');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Save comparison data to file
export async function saveComparison(comparison: ComparisonData): Promise<string> {
  await ensureStorageDir();
  
  const filename = `${comparison.id}.json`;
  const filepath = path.join(STORAGE_DIR, filename);
  
  // Add metadata
  const comparisonWithMeta = {
    ...comparison,
    savedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  await fs.writeFile(filepath, JSON.stringify(comparisonWithMeta, null, 2));
  return comparison.id;
}

// Load comparison data from file
export async function loadComparison(id: string): Promise<ComparisonData | null> {
  try {
    await ensureStorageDir();
    
    const filename = `${id}.json`;
    const filepath = path.join(STORAGE_DIR, filename);
    
    const data = await fs.readFile(filepath, 'utf-8');
    const comparison = JSON.parse(data);
    
    // Convert date strings back to Date objects
    comparison.createdAt = new Date(comparison.createdAt);
    if (comparison.savedAt) {
      comparison.savedAt = new Date(comparison.savedAt);
    }
    
    return comparison;
  } catch (error) {
    console.error('Error loading comparison:', error);
    return null;
  }
}

// Get all comparison IDs and metadata
export async function getAllComparisons(): Promise<Array<{
  id: string;
  title: string;
  createdAt: Date;
  savedAt: Date;
  promptCount: number;
  averageQuality: number;
  totalCost: number;
}>> {
  try {
    await ensureStorageDir();
    
    const files = await fs.readdir(STORAGE_DIR);
    const comparisons = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filepath = path.join(STORAGE_DIR, file);
          const data = await fs.readFile(filepath, 'utf-8');
          const comparison = JSON.parse(data);
          
          // Generate a title from the first prompt
          const title = comparison.promptVariations?.[0]?.name || 
                       comparison.promptVariations?.[0]?.content?.substring(0, 50) + '...' ||
                       `Comparison ${comparison.id}`;
          
          comparisons.push({
            id: comparison.id,
            title,
            createdAt: new Date(comparison.createdAt),
            savedAt: new Date(comparison.savedAt || comparison.createdAt),
            promptCount: comparison.promptVariations?.length || 0,
            averageQuality: comparison.summary?.averageQuality || 0,
            totalCost: comparison.summary?.totalCost || 0,
          });
        } catch (error) {
          console.error(`Error reading comparison file ${file}:`, error);
        }
      }
    }
    
    // Sort by saved date (newest first)
    return comparisons.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  } catch (error) {
    console.error('Error getting all comparisons:', error);
    return [];
  }
}

// Delete a comparison
export async function deleteComparison(id: string): Promise<boolean> {
  try {
    await ensureStorageDir();
    
    const filename = `${id}.json`;
    const filepath = path.join(STORAGE_DIR, filename);
    
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return false;
  }
}

// Export comparison data
export async function exportComparison(id: string, format: 'json' | 'csv' = 'json'): Promise<string> {
  const comparison = await loadComparison(id);
  if (!comparison) {
    throw new Error('Comparison not found');
  }
  
  if (format === 'json') {
    return JSON.stringify(comparison, null, 2);
  }
  
  // CSV format
  const csvRows = [];
  csvRows.push(['Prompt Name', 'Quality Score', 'Execution Time (ms)', 'Total Tokens', 'Cost', 'Output']);
  
  comparison.results.forEach(result => {
    const promptName = comparison.promptVariations.find(p => p.id === result.promptId)?.name || 'Unknown';
    const qualityScore = result.qualityMetrics?.overall || 0;
    const executionTime = result.executionTime || 0;
    const totalTokens = result.tokenUsage?.totalTokens || 0;
    const cost = result.tokenUsage?.estimatedCost || 0;
    const output = (result.output || '').replace(/"/g, '""'); // Escape quotes
    
    csvRows.push([
      promptName,
      qualityScore.toString(),
      executionTime.toString(),
      totalTokens.toString(),
      cost.toString(),
      `"${output}"`
    ]);
  });
  
  return csvRows.map(row => row.join(',')).join('\n');
}
