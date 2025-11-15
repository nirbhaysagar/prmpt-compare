import { NextRequest, NextResponse } from 'next/server';
import { exportComparison } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const format = url.searchParams.get('format') as 'json' | 'csv' || 'json';
    
    if (!id) {
      return NextResponse.json({ error: 'Comparison ID required' }, { status: 400 });
    }
    
    const data = await exportComparison(id, format);
    
    const headers = new Headers();
    headers.set('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="comparison-${id}.${format}"`);
    
    return new NextResponse(data, { headers });
  } catch (error) {
    console.error('Error exporting comparison:', error);
    return NextResponse.json(
      { error: 'Failed to export comparison' },
      { status: 500 }
    );
  }
}
