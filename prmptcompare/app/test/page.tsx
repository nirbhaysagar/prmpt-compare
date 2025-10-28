'use client';

import { useState, useEffect } from 'react';
import { PromptVariation, Variable, ComparisonData } from '@/types';
import Link from 'next/link';
import { formatTime, formatCost, getQualityColor, getQualityBgColor } from '@/lib/utils';

export default function TestPage() {
  const [prompts, setPrompts] = useState<PromptVariation[]>([
    { id: '1', content: '', name: 'Prompt A' },
    { id: '2', content: '', name: 'Prompt B' }
  ]);
  
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableKey, setVariableKey] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load comparison from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const comparisonId = urlParams.get('id');
      if (comparisonId) {
        loadComparison(comparisonId);
      }
    }
  }, []);

  const loadComparison = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comparisons?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to load comparison');
      }
      const data = await response.json();
      
      // Restore the comparison data
      setPrompts(data.promptVariations);
      setVariables(data.variables);
      setComparisonData(data);
      
      setSaveMessage('Comparison loaded successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const saveComparison = async () => {
    if (!comparisonData) {
      setError('No comparison data to save');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comparisonData),
      });

      if (!response.ok) {
        throw new Error('Failed to save comparison');
      }

      const result = await response.json();
      setSaveMessage('Comparison saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save comparison');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearAll = () => {
    setPrompts([
      { id: '1', content: '', name: 'Prompt A' },
      { id: '2', content: '', name: 'Prompt B' }
    ]);
    setVariables([]);
    setVariableKey('');
    setVariableValue('');
    setComparisonData(null);
    setError(null);
  };

  const loadExample = (exampleType: string) => {
    clearAll();
    if (exampleType === 'summarize') {
      setPrompts([
        { id: '1', content: 'Summarize the following article in 3 sentences: {{article_text}}', name: 'Prompt A' },
        { id: '2', content: 'Provide a brief summary of this article, highlighting the main points: {{article_text}}', name: 'Prompt B' }
      ]);
      setVariableKey('article_text');
      setVariableValue('Artificial intelligence is transforming how we work and live. Companies are investing billions in AI research and development. The technology promises to automate mundane tasks and unlock new possibilities across industries.');
    } else if (exampleType === 'email') {
      setPrompts([
        { id: '1', content: 'Write a professional email about {{topic}} in a {{tone}} tone.', name: 'Prompt A' },
        { id: '2', content: 'Compose an email regarding {{topic}} with a {{tone}} approach.', name: 'Prompt B' }
      ]);
      setVariableKey('topic');
      setVariableValue('Project Update');
      setVariables([{ key: 'topic', value: 'Project Update' }, { key: 'tone', value: 'professional' }]);
    } else if (exampleType === 'code') {
      setPrompts([
        { id: '1', content: 'Write a {{language}} function to {{task}}', name: 'Prompt A' },
        { id: '2', content: 'Create a {{language}} solution for {{task}} with error handling', name: 'Prompt B' }
      ]);
      setVariableKey('language');
      setVariableValue('Python');
      setVariables([{ key: 'language', value: 'Python' }, { key: 'task', value: 'sort a list' }]);
    }
  };

  const handleCompare = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ prompts, variables })
      });

      if (!response.ok) {
        throw new Error('Failed to compare prompts');
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariable = () => {
    if (variableKey && variableValue) {
      setVariables([...variables, { key: variableKey, value: variableValue }]);
      setVariableKey('');
      setVariableValue('');
    }
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleRemovePrompt = (id: string) => {
    if (prompts.length > 2) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handleAddPrompt = () => {
    const newId = (prompts.length + 1).toString();
    setPrompts([...prompts, { id: newId, content: '', name: `Prompt ${String.fromCharCode(64 + parseInt(newId))}` }]);
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-13.12-7.96-8.32-14.96z"/>
                  </svg>
                )}
              </button>
              <Link href="/history" className="text-gray-600 hover:text-gray-900 font-medium">History</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Back to Home</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Prompt Testing Lab
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare multiple AI prompts side-by-side with real-time performance metrics and detailed analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Your API key is processed locally and never stored
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Inputs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17h18v2H3zm0-4h18v2H3zm0-4h18v2H3zm0-4h18v2H3z"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Prompt Variations</h2>
                </div>
                <button
                  onClick={handleAddPrompt}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span className="text-sm font-medium">Add Prompt</span>
                </button>
              </div>

              <div className="space-y-6">
                {prompts.map((prompt, idx) => (
                  <div key={prompt.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {prompt.name}
                      </label>
                      {prompts.length > 2 && (
                        <button
                          onClick={() => handleRemovePrompt(prompt.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={prompt.content}
                      onChange={(e) => {
                        const newPrompts = [...prompts];
                        newPrompts[idx].content = e.target.value;
                        setPrompts(newPrompts);
                      }}
                      placeholder="Enter your prompt here. Use {{variable_name}} for variables."
                      className="w-full p-4 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      rows={6}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Variables Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dynamic Variables</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add variables to use in your prompts with <code className="bg-gray-100 px-2 py-1 rounded text-sm">{`{{variable_name}}`}</code>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Variable name (e.g., article_text)"
                    value={variableKey}
                    onChange={(e) => setVariableKey(e.target.value)}
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <textarea
                    placeholder="Variable value"
                    value={variableValue}
                    onChange={(e) => setVariableValue(e.target.value)}
                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows={3}
                  />
                </div>
                
                <button
                  onClick={handleAddVariable}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span className="text-sm font-medium">Add Variable</span>
                </button>

                {/* Display added variables */}
                {variables.length > 0 && (
                  <div className="space-y-2">
                    {variables.map((variable, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <code className="bg-white px-2 py-1 rounded text-sm font-mono">{`{{${variable.key}}}`}</code>
                          <span className="text-sm text-gray-600 truncate max-w-xs">{variable.value}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveVariable(idx)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
              <button
                onClick={handleCompare}
                disabled={isLoading || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running Comparison...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zM3 17h6v2H3zm0-4h6v2H3zm0-4h6v2H3z"/>
                    </svg>
                    <span>Run Comparison</span>
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prompts</span>
                  <span className="font-semibold text-gray-900">{prompts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Variables</span>
                  <span className="font-semibold text-gray-900">{variables.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Key</span>
                  <span className={`font-semibold ${apiKey.trim() ? 'text-green-600' : 'text-red-600'}`}>
                    {apiKey.trim() ? 'Configured' : 'Required'}
                  </span>
                </div>
                {comparisonData && comparisonData.summary && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Best Quality</span>
                        <span className="font-semibold text-green-600">{comparisonData.summary.averageQuality}/100</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Total Cost</span>
                        <span className="font-semibold text-blue-600">{formatCost(comparisonData.summary.totalCost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Tokens</span>
                        <span className="font-semibold text-purple-600">{comparisonData.summary.totalTokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
              <div className="space-y-2">
                <button
                  onClick={() => loadExample('summarize')}
                  className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                >
                  📄 Summarize Article
                </button>
                <button
                  onClick={() => loadExample('email')}
                  className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                >
                  ✉️ Write Email
                </button>
                <button
                  onClick={() => loadExample('code')}
                  className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
                >
                  💻 Generate Code
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Quality scores help identify the best prompts</li>
                <li>• Monitor token usage to optimize costs</li>
                <li>• Higher efficiency = better quality per token</li>
                <li>• Compare relevance, coherence, and completeness</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <p className="text-green-700 font-medium">{saveMessage}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {comparisonData && (
          <div className="mt-8 space-y-6">
            {/* Summary Analytics */}
            {comparisonData.summary && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comparison Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{comparisonData.summary.averageQuality}</div>
                    <div className="text-sm text-gray-600">Avg Quality Score</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCost(comparisonData.summary.totalCost)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{comparisonData.summary.totalTokens.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Tokens</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {comparisonData.results.reduce((acc, result) => acc + (result.executionTime || 0), 0)}ms
                    </div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Detailed Results</h2>
                </div>
                <div className="flex items-center space-x-4">
                  {comparisonData.summary && (
                    <div className="text-sm text-gray-500">
                      Best: {comparisonData.promptVariations.find(p => p.id === comparisonData.summary?.bestPrompt)?.name}
                    </div>
                  )}
                  <button
                    onClick={saveComparison}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </svg>
                    <span className="text-sm font-medium">{isSaving ? 'Saving...' : 'Save Comparison'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {comparisonData.results.map((result, idx) => (
                  <div key={result.promptId} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg text-gray-900">{result.promptName}</h3>
                        {result.qualityMetrics && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityBgColor(result.qualityMetrics.overall)} ${getQualityColor(result.qualityMetrics.overall)}`}>
                            {result.qualityMetrics.overall}/100
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatTime(result.executionTime || 0)}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    {result.qualityMetrics && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-blue-600">{result.qualityMetrics.relevance}</div>
                            <div className="text-xs text-gray-600">Relevance</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-green-600">{result.qualityMetrics.coherence}</div>
                            <div className="text-xs text-gray-600">Coherence</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-purple-600">{result.qualityMetrics.completeness}</div>
                            <div className="text-xs text-gray-600">Completeness</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-orange-600">{result.qualityMetrics.creativity}</div>
                            <div className="text-xs text-gray-600">Creativity</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Token Usage & Performance */}
                    {result.tokenUsage && result.performanceMetrics && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-indigo-600">{result.tokenUsage.totalTokens}</div>
                            <div className="text-xs text-gray-600">Total Tokens</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-pink-600">{formatCost(result.tokenUsage.estimatedCost)}</div>
                            <div className="text-xs text-gray-600">Cost</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-teal-600">{result.performanceMetrics.throughput.toFixed(1)}</div>
                            <div className="text-xs text-gray-600">Tokens/sec</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold text-cyan-600">{result.performanceMetrics.efficiency.toFixed(3)}</div>
                            <div className="text-xs text-gray-600">Quality/Token</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Response Output */}
                    <div className="relative">
                      <div className="bg-gray-50 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {result.output}
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.output, idx)}
                        className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
