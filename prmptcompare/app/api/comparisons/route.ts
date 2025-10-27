import { NextRequest, NextResponse } from 'next/server';
import { saveComparison, loadComparison, getAllComparisons, deleteComparison, exportComparison } from '@/lib/storage';
import { ComparisonData } from '@/types';

// Save a comparison
export async function POST(request: NextRequest) {
  try {
    const comparison: ComparisonData = await request.json();
    
    if (!comparison.id || !comparison.results || !comparison.promptVariations) {
      return NextResponse.json({ error: 'Invalid comparison data' }, { status: 400 });
    }
    
    const savedId = await saveComparison(comparison);
    
    return NextResponse.json({ 
      success: true, 
      id: savedId,
      message: 'Comparison saved successfully' 
    });
  } catch (error) {
    console.error('Error saving comparison:', error);
    return NextResponse.json(
      { error: 'Failed to save comparison' },
      { status: 500 }
    );
  }
}

// Get all comparisons
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Get specific comparison
      const comparison = await loadComparison(id);
      if (!comparison) {
        return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
      }
      return NextResponse.json(comparison);
    } else {
      // Get all comparisons
      const comparisons = await getAllComparisons();
      return NextResponse.json(comparisons);
    }
  } catch (error) {
    console.error('Error getting comparisons:', error);
    return NextResponse.json(
      { error: 'Failed to get comparisons' },
      { status: 500 }
    );
  }
}

// Delete a comparison
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Comparison ID required' }, { status: 400 });
    }
    
    const success = await deleteComparison(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete comparison' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Comparison deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return NextResponse.json(
      { error: 'Failed to delete comparison' },
      { status: 500 }
    );
  }
}
