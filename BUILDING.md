# 🏗️ Building PromptCompare - MVP Implementation Guide

This document provides step-by-step guidance on building the PromptCompare MVP.

## 📁 Project Structure Overview

```
prmptcompare/
├── README.md                    # Project documentation
├── BUILDING.md                  # This file
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
├── next.config.js              # Next.js config
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── api/compare/route.ts    # Compare API endpoint
│   └── api/share/route.ts      # Share API endpoint
│
├── components/                 # React components
│   ├── ui/                     # Reusable UI
│   ├── PromptInput.tsx
│   ├── VariableInput.tsx
│   └── ComparisonView.tsx
│
├── lib/                        # Utilities
│   └── utils.ts
│
└── types/                      # TypeScript types
    └── index.ts
```

## 🎯 Core Technologies Explained

### 1. Next.js (React Framework)
- **What it is:** Full-stack React framework
- **Why we use it:** Built-in API routes, server-side rendering, easy deployment
- **Key feature:** Can handle both frontend (React) and backend (API routes) in one app

### 2. TypeScript
- **What it is:** JavaScript with type annotations
- **Why we use it:** Catches bugs before runtime, better IDE support
- **Example:** `const name: string = "John"` vs `const name = "John"`

### 3. Tailwind CSS
- **What it is:** Utility-first CSS framework
- **Why we use it:** Rapid UI development, consistent styling
- **Example:** `className="bg-blue-500 text-white p-4 rounded"`

### 4. OpenAI API
- **What it is:** API to access GPT models
- **Why we use it:** User brings their own API key, we just make calls
- **Key point:** API key stays on server, never exposed to browser

## 📝 Key Files to Create

### File 1: `package.json`
```json
{
  "name": "prmptcompare",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next": "^14.0.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### File 2: `types/index.ts` - TypeScript Types
```typescript
// These define the shape of our data structures

export interface PromptVariation {
  id: string;           // Unique ID for each prompt
  content: string;      // The actual prompt text
  name?: string;        // Optional display name
}

export interface Variable {
  key: string;         // Variable name like "article_text"
  value: string;       // The actual value to substitute
}

export interface PromptResult {
  promptId: string;           // Which prompt was used
  model: string;              // Which LLM was used
  output: string;             // The AI's response
  executionTime?: number;     // How long it took (ms)
}

export interface ComparisonData {
  id: string;
  variables: Variable[];
  promptVariations: PromptVariation[];
  results: PromptResult[];
  createdAt: Date;
}
```

### File 3: `lib/utils.ts` - Utility Functions
```typescript
// Helper function to replace template variables
export function replaceVariables(prompt: string, variables: Variable[]): string {
  let result = prompt;
  variables.forEach(({ key, value }) => {
    // Replace {{variable_name}} with actual value
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

// Validate that all variables are provided
export function validatePrompt(prompt: string, variables: Variable[]): boolean {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const matches = [...prompt.matchAll(variablePattern)];
  const requiredKeys = matches.map(m => m[1]);
  const providedKeys = variables.map(v => v.key);
  return requiredKeys.every(key => providedKeys.includes(key));
}
```

### File 4: `app/api/compare/route.ts` - API Endpoint
```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompts, variables } = await request.json();
    
    // Get API key from request header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Run each prompt and collect results
    const results = await Promise.all(
      prompts.map(async (prompt: any) => {
        const startTime = Date.now();
        
        // Replace variables in prompt (e.g., {{name}} -> "John")
        const finalPrompt = replaceVariables(prompt.content, variables);

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: finalPrompt }],
        });

        return {
          promptId: prompt.id,
          output: completion.choices[0].message.content || '',
          executionTime: Date.now() - startTime,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compare' }, { status: 500 });
  }
}
```

### File 5: `app/page.tsx` - Main UI
```typescript
'use client';  // This tells Next.js this is a client component

import { useState } from 'react';
import { PromptVariation, Variable } from '@/types';

export default function HomePage() {
  // State to store prompts
  const [prompts, setPrompts] = useState<PromptVariation[]>([
    { id: '1', content: '', name: 'Prompt A' },
    { id: '2', content: '', name: 'Prompt B' }
  ]);
  
  const [variables, setVariables] = useState<Variable[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ prompts, variables })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        ⚖️ PromptCompare
      </h1>

      {/* API Key Input */}
      <div className="max-w-2xl mx-auto mb-4">
        <input
          type="password"
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Prompt Inputs */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        {prompts.map((prompt, idx) => (
          <div key={prompt.id} className="mb-4">
            <label className="block font-semibold mb-2">{prompt.name}</label>
            <textarea
              value={prompt.content}
              onChange={(e) => {
                const newPrompts = [...prompts];
                newPrompts[idx].content = e.target.value;
                setPrompts(newPrompts);
              }}
              placeholder="Enter your prompt here. Use {{variable_name}} for variables."
              className="w-full p-3 border rounded-lg font-mono"
              rows={5}
            />
          </div>
        ))}

        {/* Variables Section */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Variables</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Variable name (e.g., article_text)"
              className="w-1/3 p-2 border rounded"
            />
            <textarea
              placeholder="Variable value"
              className="w-2/3 p-2 border rounded"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Comparing...' : 'Run Comparison'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-2 gap-4">
            {results.results.map((result: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">{prompts[idx].name}</h3>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                  {result.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🔑 Key Concepts Explained

### 1. React Hooks (useState)
```typescript
const [prompts, setPrompts] = useState([]);
```
- `prompts` - current state value
- `setPrompts` - function to update state
- When you call `setPrompts([...])`, React re-renders the component

### 2. Async/Await
```typescript
const response = await fetch('/api/compare');
const data = await response.json();
```
- `await` - pauses execution until promise resolves
- Makes async code look synchronous
- Prevents callback hell

### 3. Promise.all
```typescript
const results = await Promise.all(prompts.map(async (prompt) => {
  // Run each prompt in parallel
}));
```
- Runs multiple async operations concurrently
- Waits for all to complete before continuing
- Faster than running sequentially

### 4. Template Variables
```typescript
// In prompt: "Summarize {{article_text}}"
// With variable: { key: "article_text", value: "Long article..." }
// Result: "Summarize Long article..."
```
- Users can insert dynamic values into prompts
- Uses `{{variable_name}}` syntax
- Gets replaced before sending to API

## 🎨 Styling with Tailwind

```tsx
className="bg-blue-600 text-white py-3 rounded-lg"
```

Breakdown:
- `bg-blue-600` - blue background
- `text-white` - white text
- `py-3` - vertical padding
- `rounded-lg` - rounded corners

Full list: https://tailwindcss.com/docs

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## 📚 What to Build First

1. **Week 1:** Basic UI with input fields
2. **Week 2:** Connect to OpenAI API, display results
3. **Week 3:** Add sharing, rating, polish UI

## 🎓 Learning Resources

- Next.js: https://nextjs.org/learn
- React: https://react.dev/learn
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs
- OpenAI: https://platform.openai.com/docs

## 💡 Tips

1. Start simple - build basic version first
2. Test each piece as you go
3. Use TypeScript for fewer bugs
4. Keep API keys secure (never in client code)
5. Use Tailwind for fast styling

Good luck building! 🚀
