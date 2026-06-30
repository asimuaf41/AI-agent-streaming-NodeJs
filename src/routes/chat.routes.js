import { Router } from 'express';
import {
  chatStreamController,
  chatToolStreamController
} from '../controllers/chat.controller.js';
import {
  deleteRealEstateDocumentController,
  getRealEstateDocumentsController,
  realEstateSeedController,
  realEstateStreamController
} from '../controllers/realEstate.controller.js';
import { weatherStreamController } from '../controllers/weather.controller.js';
import {
  deleteMemoryController,
  getMemoriesController,
  webSearchStreamController
} from '../controllers/webSearch.controller.js';
import { multiAgentStreamController } from '../controllers/multiAgent.controller.js';

const router = Router();

router.post('/chat', chatStreamController);
router.post('/chat/tool', chatToolStreamController);

router.post('/chat/weather', weatherStreamController);

router.post('/chat/web-search', webSearchStreamController);
router.get('/chat/web-search/memories', getMemoriesController);
router.delete('/chat/web-search/memories/:id', deleteMemoryController);

router.post('/chat/real-estate', realEstateStreamController);
router.post('/chat/real-estate/seed', realEstateSeedController);
router.get('/chat/real-estate/documents', getRealEstateDocumentsController);
router.delete(
  '/chat/real-estate/documents/:sourceFile',
  deleteRealEstateDocumentController
);

router.post('/chat/multi-agent', multiAgentStreamController);

export { router as chatRouter };



/* 

CEO (Orchestrator)
├── Research Manager    → finds market data
├── Database Analyst    → queries property listings  
├── Report Writer       → writes professional report
└── Communication Lead  → sends email to client
*/


/* 
import Anthropic from '@anthropic-ai/sdk';
import { retrieveRelevantChunks } from './rag.js';
import { searchMemories } from './memory.js';
import fetch from 'node-fetch';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────
// SPECIALIST AGENTS — each expert at one thing
// These are simple functions that return results
// ─────────────────────────────────────────

// AGENT 1: Research Agent — searches the web
async function researchAgent(topic) {
  console.log(`\n🔬 Research Agent: searching for "${topic}"`);

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: topic,
      max_results: 3,
      search_depth: 'basic'
    })
  });

  const data = await response.json();
  const results = data.results?.map(r => ({
    title:   r.title,
    url:     r.url,
    content: r.content?.substring(0, 400)
  })) || [];

  // Use Claude to summarize the search results
  const summary = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 800,
    system:     'You are a research specialist. Summarize the following search results into clear, concise key points. Focus on facts and data.',
    messages: [{
      role:    'user',
      content: `Topic: ${topic}\n\nSearch Results:\n${JSON.stringify(results, null, 2)}\n\nProvide a structured summary with key findings.`
    }]
  });

  const result = summary.content[0].text;
  console.log(`   ✅ Research complete — ${result.length} chars`);
  return result;
}

// AGENT 2: Database Agent — queries your RAG system
async function databaseAgent(query) {
  console.log(`\n🗄️  Database Agent: querying for "${query}"`);

  const chunks = await retrieveRelevantChunks(query, 5);

  if (chunks.length === 0) {
    return 'No relevant property data found in database.';
  }

  const context = chunks.map(c => c.content).join('\n\n');

  // Use Claude to extract structured data
  const analysis = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 800,
    system:     'You are a database analyst. Extract and structure the relevant property information from the provided data. Present findings clearly with specific details like addresses, prices, and features.',
    messages: [{
      role:    'user',
      content: `Query: ${query}\n\nDatabase Content:\n${context}\n\nExtract all relevant property information.`
    }]
  });

  const result = analysis.content[0].text;
  console.log(`   ✅ Database query complete — ${chunks.length} chunks found`);
  return result;
}

// AGENT 3: Analysis Agent — compares and scores options
async function analysisAgent(data, criteria) {
  console.log(`\n📊 Analysis Agent: analyzing data against criteria`);

  const analysis = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 1000,
    system:     'You are a senior data analyst specializing in real estate. Analyze the provided data objectively and give clear recommendations with reasoning. Use scoring where appropriate.',
    messages: [{
      role:    'user',
      content: `Criteria: ${criteria}\n\nData to Analyze:\n${data}\n\nProvide a structured analysis with scores (1-10) and clear recommendations.`
    }]
  });

  const result = analysis.content[0].text;
  console.log(`   ✅ Analysis complete`);
  return result;
}

// AGENT 4: Writer Agent — creates professional reports
async function writerAgent(researchData, databaseData, analysisData, topic) {
  console.log(`\n✍️  Writer Agent: creating professional report`);

  const report = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 2000,
    system:     'You are a professional business report writer. Create clear, well-structured, client-ready reports in markdown format. Be professional, specific, and actionable.',
    messages: [{
      role:    'user',
      content: `Create a professional real estate report on: ${topic}

Use these inputs:

MARKET RESEARCH:
${researchData}

AVAILABLE PROPERTIES:
${databaseData}

ANALYSIS & RECOMMENDATIONS:
${analysisData}

Write a complete professional report with:
- Executive Summary
- Market Overview
- Available Properties
- Analysis & Scores
- Top Recommendations
- Next Steps`
    }]
  });

  const result = report.content[0].text;
  console.log(`   ✅ Report written — ${result.length} chars`);
  return result;
}

// ─────────────────────────────────────────
// ORCHESTRATOR — the manager agent
// Coordinates all specialist agents
// Decides what to run, when, and in what order
// ─────────────────────────────────────────
async function orchestrator(userRequest) {
  console.log('\n' + '═'.repeat(55));
  console.log('🎯 ORCHESTRATOR STARTING');
  console.log(`📋 Request: ${userRequest}`);
  console.log('═'.repeat(55));

  // Step 1 — Orchestrator plans the work using Claude
  console.log('\n📋 Step 1: Planning...');
  const planResponse = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 500,
    system:     `You are an orchestrator that plans multi-agent tasks.
Given a user request, output a JSON plan with these fields:
- research_query: what to search on the web
- database_query: what to find in property database
- analysis_criteria: how to evaluate the results
- report_topic: what the final report should cover

Return ONLY valid JSON, no other text.`,
    messages: [{ role: 'user', content: userRequest }]
  });

  let plan;
  try {
    plan = JSON.parse(planResponse.content[0].text);
  } catch {
    // Fallback plan if JSON parsing fails
    plan = {
      research_query:    userRequest,
      database_query:    userRequest,
      analysis_criteria: 'value for money, location, condition',
      report_topic:      userRequest
    };
  }

  console.log('   Plan created:', plan);

  // Step 2 — Run Research Agent and Database Agent IN PARALLEL
  // Promise.all runs both at the same time — faster than sequential
  console.log('\n⚡ Step 2: Running Research + Database agents in parallel...');
  const [researchResult, databaseResult] = await Promise.all([
    researchAgent(plan.research_query),
    databaseAgent(plan.database_query)
  ]);

  // Step 3 — Run Analysis Agent with combined data
  console.log('\n📊 Step 3: Running Analysis agent...');
  const analysisResult = await analysisAgent(
    `${researchResult}\n\n${databaseResult}`,
    plan.analysis_criteria
  );

  // Step 4 — Run Writer Agent with all results
  console.log('\n✍️  Step 4: Running Writer agent...');
  const finalReport = await writerAgent(
    researchResult,
    databaseResult,
    analysisResult,
    plan.report_topic
  );

  // Step 5 — Save the report
  const filename = `reports/multi-agent-report-${Date.now()}.md`;
  if (!fs.existsSync('reports')) fs.mkdirSync('reports');
  fs.writeFileSync(filename, finalReport);

  console.log('\n' + '═'.repeat(55));
  console.log('✅ ALL AGENTS COMPLETE');
  console.log(`📄 Report saved: ${filename}`);
  console.log('═'.repeat(55));

  console.log('\n📑 FINAL REPORT PREVIEW:');
  console.log(finalReport.substring(0, 500) + '...');

  return { plan, researchResult, databaseResult, analysisResult, finalReport };
}

// ─────────────────────────────────────────
// RUN IT
// ─────────────────────────────────────────
orchestrator(
  'Find me properties in Atlanta under $450,000 suitable for a young family, and analyze the current market conditions'
);
*/