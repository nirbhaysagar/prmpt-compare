'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatTime, formatCost, getQualityColor, getQualityBgColor } from '@/lib/utils';

interface ComparisonSummary {
  id: string;
  title: string;
  createdAt: Date;
  savedAt: Date;
  promptCount: number;
  averageQuality: number;
  totalCost: number;
}

export default function HistoryPage() {
  const [comparisons, setComparisons] = useState<ComparisonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'cost' | 'prompts'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'high-quality' | 'recent' | 'expensive'>('all');

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/comparisons');
      if (!response.ok) {
        throw new Error('Failed to load comparisons');
      }
      const data = await response.json();
      setComparisons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comparison? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/comparisons?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comparison');
      }
      
      setComparisons(comparisons.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comparison');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (id: string, format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/comparisons/export?id=${id}&format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to export comparison');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export comparison');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete all comparisons? This action cannot be undone.')) {
      return;
    }

    try {
      const deletePromises = comparisons.map(comparison => 
        fetch(`/api/comparisons?id=${comparison.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setComparisons([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comparisons');
    }
  };

  // Filter and sort comparisons
  const filteredComparisons = comparisons
    .filter(comparison => {
      // Search filter
      if (searchTerm && !comparison.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      switch (filterBy) {
        case 'high-quality':
          return comparison.averageQuality >= 80;
        case 'recent':
          return new Date(comparison.savedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        case 'expensive':
          return comparison.totalCost > 0.01; // More than 1 cent
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return b.averageQuality - a.averageQuality;
        case 'cost':
          return b.totalCost - a.totalCost;
        case 'prompts':
          return b.promptCount - a.promptCount;
        case 'date':
        default:
          return b.savedAt.getTime() - a.savedAt.getTime();
      }
    });

  const totalCost = comparisons.reduce((sum, c) => sum + c.totalCost, 0);
  const averageQuality = comparisons.length > 0 
    ? Math.round(comparisons.reduce((sum, c) => sum + c.averageQuality, 0) / comparisons.length)
    : 0;
  const totalTests = comparisons.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading comparison history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">PromptCompare</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/test" className="text-gray-600 hover:text-gray-900 font-medium">New Test</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Comparison History</h1>
          <p className="text-lg text-gray-600">Track your prompt optimization journey over time</p>
        </div>

        {/* Stats Overview */}
        {comparisons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Quality</p>
                  <p className="text-3xl font-bold text-green-600">{averageQuality}/100</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCost(totalCost)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Best Quality</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.max(...comparisons.map(c => c.averageQuality))}/100
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        {comparisons.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search comparisons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="quality">Sort by Quality</option>
                <option value="cost">Sort by Cost</option>
                <option value="prompts">Sort by Prompt Count</option>
              </select>
              
              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Comparisons</option>
                <option value="high-quality">High Quality (80+)</option>
                <option value="recent">Recent (7 days)</option>
                <option value="expensive">Expensive ({'>'}$0.01)</option>
              </select>
              
              {/* Bulk Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Comparisons List */}
        {filteredComparisons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {comparisons.length === 0 ? 'No comparisons yet' : 'No matching comparisons'}
            </h3>
            <p className="text-gray-600 mb-6">
              {comparisons.length === 0 
                ? 'Start testing prompts to build your optimization history'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {comparisons.length === 0 && (
              <Link 
                href="/test"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Start Testing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComparisons.map((comparison) => (
              <div key={comparison.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{comparison.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBgColor(comparison.averageQuality)} ${getQualityColor(comparison.averageQuality)}`}>
                        {comparison.averageQuality}/100
                      </div>
                      {comparison.averageQuality >= 90 && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          ⭐ Excellent
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>{comparison.promptCount} prompts</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>{formatCost(comparison.totalCost)} cost</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>{new Date(comparison.savedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/test?id=${comparison.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                    
                    <div className="relative group">
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Export
                      </button>
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleExport(comparison.id, 'json')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={() => handleExport(comparison.id, 'csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(comparison.id)}
                      disabled={deletingId === comparison.id}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === comparison.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
