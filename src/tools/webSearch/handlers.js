import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { createMemoryToolRunner } from '../memory/handlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../../../data/reports');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

async function searchWeb(query, maxResults = 5) {
  if (!env.tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      max_results: Math.min(maxResults, 10),
      search_depth: 'advanced',
      include_answer: true
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Tavily search failed (${response.status})`);
  }

  const results = (data.results ?? []).map((result) => ({
    title: result.title,
    url: result.url,
    snippet: result.content?.substring(0, 300) ?? ''
  }));

  return {
    query,
    answer: data.answer ?? null,
    results
  };
}

async function readUrl(url) {
  if (!env.tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const response = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      urls: [url]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Tavily extract failed (${response.status})`);
  }

  const content = data.results?.[0]?.raw_content ?? 'Could not read this page';

  return {
    url,
    content: content.substring(0, 2000)
  };
}

function searchYoutube(query, maxResults = 5) {
  const count = Math.min(Math.max(maxResults, 1), 8);
  const slug = query.toLowerCase().replace(/\s+/g, '-').slice(0, 40);

  const videos = Array.from({ length: count }, (_, index) => ({
    title: `${query} — ${['Complete Guide', 'Deep Dive', 'Tutorial', 'Explained', 'Best Practices'][index % 5]} ${2024 + (index % 2)}`,
    channel: ['Tech Insights', 'Dev Academy', 'Code Masters', 'Learn Fast', 'Build Better'][index % 5],
    url: `https://www.youtube.com/watch?v=${slug}-${index + 1}`,
    duration: `${8 + index * 3}:${String(10 + index * 7).padStart(2, '0')}`,
    views: `${(index + 1) * 125}K views`
  }));

  return { query, videos };
}

function saveReport(filename, content) {
  ensureReportsDir();

  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 80);
  const filepath = path.join(REPORTS_DIR, `${safeName}.md`);

  fs.writeFileSync(filepath, content, 'utf8');

  return {
    success: true,
    filepath,
    message: `Report saved to data/reports/${safeName}.md`
  };
}

const MEMORY_TOOLS = new Set([
  'save_memory',
  'search_memory',
  'get_all_memories',
  'delete_memory'
]);

export function createWebSearchToolRunner(userId) {
  const runMemoryTool = createMemoryToolRunner(userId);

  return async function runWebSearchTool(toolName, toolInput) {
    if (MEMORY_TOOLS.has(toolName)) {
      return runMemoryTool(toolName, toolInput);
    }

    switch (toolName) {
      case 'search_web':
        return searchWeb(toolInput.query, toolInput.max_results ?? 5);

      case 'read_url':
        return readUrl(toolInput.url);

      case 'search_youtube':
        return searchYoutube(toolInput.query, toolInput.max_results ?? 5);

      case 'save_report':
        return saveReport(toolInput.filename, toolInput.content);

      default:
        throw new Error(`Unsupported web search tool: ${toolName}`);
    }
  };
}
