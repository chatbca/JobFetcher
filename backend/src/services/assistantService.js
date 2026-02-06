import dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Initialize Gemini LLM
let llm = null;
let aiEnabled = false;

try {
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your_google_gemini_api_key_here') {
    llm = new ChatGoogleGenerativeAI({
      model: 'gemini-pro',
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY
    });
    aiEnabled = true;
    console.log(' Gemini AI (LangGraph) initialized');
  } else {
    console.log('  No Gemini API key - using rule-based assistant');
  }
} catch (error) {
  console.log('  Gemini initialization failed - using rule-based assistant');
  aiEnabled = false;
}

// Define state annotation
const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  intent: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null
  }),
  filters: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  action: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null
  }),
  response: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ''
  })
});

// Node: Detect Intent
async function detectIntentNode(state) {
  const userMessage = state.messages[state.messages.length - 1].content;
  
  if (!aiEnabled || !llm) {
    return { intent: detectIntentRuleBased(userMessage) };
  }
  
  try {
    const prompt = `You are an AI assistant for a job tracking application.
Analyze this message and respond with ONLY ONE word:
- FILTER_UPDATE (user wants to filter jobs by remote/location/skills/date/etc)
- JOB_SEARCH (user searching for specific jobs)
- HELP (user needs help)
- APPLICATIONS (user asks about their applications)
- RESUME (user asks about resume)

User message: "${userMessage}"

Respond with ONE WORD ONLY.`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const intent = response.content.trim().toUpperCase();
    
    if (['FILTER_UPDATE', 'JOB_SEARCH', 'HELP', 'APPLICATIONS', 'RESUME'].includes(intent)) {
      return { intent };
    }
    return { intent: 'JOB_SEARCH' };
  } catch (error) {
    console.error('Intent detection error:', error.message);
    return { intent: detectIntentRuleBased(userMessage) };
  }
}

// Node: Extract Filters
async function extractFiltersNode(state) {
  if (state.intent !== 'FILTER_UPDATE' && state.intent !== 'JOB_SEARCH') {
    return { action: 'route' };
  }
  
  const userMessage = state.messages[state.messages.length - 1].content;
  
  if (!aiEnabled || !llm) {
    return { 
      filters: extractFiltersRuleBased(userMessage),
      action: 'apply_filters'
    };
  }
  
  try {
    const prompt = `Extract filter parameters from this message.
Return ONLY a JSON object with these fields (include only mentioned fields):
{
  "workMode": "Remote" | "Hybrid" | "On-site",
  "jobType": "Full-time" | "Part-time" | "Contract" | "Internship",
  "datePosted": "24h" | "week" | "month",
  "location": "city name",
  "skills": ["skill1", "skill2"],
  "query": "search term",
  "matchScore": "high" | "medium",
  "clear": true
}

Examples:
"Show me remote jobs" -> {"workMode": "Remote"}
"React and Node.js jobs" -> {"skills": ["React", "Node.js"]}
"Last 24 hours" -> {"datePosted": "24h"}

User message: "${userMessage}"

Return ONLY valid JSON:`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const filters = JSON.parse(jsonMatch[0]);
      return { filters, action: 'apply_filters' };
    }
    
    return { filters: extractFiltersRuleBased(userMessage), action: 'apply_filters' };
  } catch (error) {
    console.error('Filter extraction error:', error.message);
    return { filters: extractFiltersRuleBased(userMessage), action: 'apply_filters' };
  }
}

// Node: Generate Response
async function generateResponseNode(state) {
  const userMessage = state.messages[state.messages.length - 1].content;
  
  let responseText = '';
  
  if (state.intent === 'HELP') {
    responseText = generateHelpResponse(userMessage);
  } else if (state.intent === 'APPLICATIONS') {
    responseText = "You can view all your job applications in the `Applications` tab. Track status changes from Applied  Interview  Offer/Rejected.";
  } else if (state.intent === 'RESUME') {
    responseText = "To upload your resume, click your profile icon and select `Upload Resume`. Accepted formats: PDF, TXT. Your resume powers the job matching scores.";
  } else if (state.action === 'apply_filters') {
    responseText = describeFilters(state.filters);
  } else {
    responseText = "I've updated the job search based on your request. Let me know if you need anything else!";
  }
  
  return { response: responseText };
}

// Rule-based fallback functions
function detectIntentRuleBased(message) {
  const lower = message.toLowerCase();
  if (lower.includes('help') || lower.includes('how do') || lower.includes('what is')) return 'HELP';
  if (lower.includes('application') || lower.includes('applied') || lower.includes('my jobs')) return 'APPLICATIONS';
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('upload')) return 'RESUME';
  if (lower.includes('remote') || lower.includes('filter') || lower.includes('show me') || 
      lower.includes('find') || lower.includes('location') || lower.includes('full-time') || 
      lower.includes('part-time') || lower.includes('hybrid')) return 'FILTER_UPDATE';
  return 'JOB_SEARCH';
}

function extractFiltersRuleBased(message) {
  const lower = message.toLowerCase();
  const filters = {};
  
  if (lower.includes('remote')) filters.workMode = 'Remote';
  if (lower.includes('hybrid')) filters.workMode = 'Hybrid';
  if (lower.includes('on-site') || lower.includes('onsite')) filters.workMode = 'On-site';
  
  if (lower.includes('full-time') || lower.includes('fulltime')) filters.jobType = 'Full-time';
  if (lower.includes('part-time') || lower.includes('parttime')) filters.jobType = 'Part-time';
  if (lower.includes('contract')) filters.jobType = 'Contract';
  if (lower.includes('internship')) filters.jobType = 'Internship';
  
  if (lower.includes('24 hour') || lower.includes('today')) filters.datePosted = '24h';
  if (lower.includes('week') || lower.includes('7 days')) filters.datePosted = 'week';
  if (lower.includes('month') || lower.includes('30 days')) filters.datePosted = 'month';
  
  if (lower.includes('high match') || lower.includes('best match')) filters.matchScore = 'high';
  if (lower.includes('medium match')) filters.matchScore = 'medium';
  
  if (lower.includes('clear') || lower.includes('reset')) filters.clear = true;
  
  const skillKeywords = ['react', 'node', 'nodejs', 'javascript', 'python', 'java', 'typescript', 'vue', 'angular', 'aws', 'azure', 'docker', 'kubernetes'];
  const foundSkills = skillKeywords.filter(skill => lower.includes(skill));
  if (foundSkills.length > 0) {
    filters.skills = foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  }
  
  return filters;
}

function generateHelpResponse(query) {
  const helpTopics = {
    resume: "Click your profile  Upload Resume. Formats: PDF/TXT. Used for AI job matching.",
    applications: "View Applications tab to track: Applied  Interview  Offer/Rejected.",
    matching: "AI scores each job 0-100% based on your resume. Green (>70%), Yellow (40-70%).",
    filters: "Filter by: Role, Skills, Date, Job Type, Work Mode, Location, Match Score.",
    apply: "Click Apply on any job. When you return, I'll ask if you applied successfully."
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [key, value] of Object.entries(helpTopics)) {
    if (lowerQuery.includes(key)) return value;
  }
  
  return "I can help with: job search, filters, resume upload, application tracking, and match scores. What do you need?";
}

function describeFilters(filters) {
  if (filters.clear) return " All filters cleared. Showing all jobs.";
  
  const parts = [];
  if (filters.workMode) parts.push(`${filters.workMode} jobs`);
  if (filters.jobType) parts.push(`${filters.jobType} positions`);
  if (filters.location) parts.push(`in ${filters.location}`);
  if (filters.skills) parts.push(`with ${filters.skills.join(', ')}`);
  if (filters.matchScore === 'high') parts.push('high match score (>70%)');
  if (filters.datePosted) {
    const dateMap = { '24h': 'last 24 hours', 'week': 'this week', 'month': 'this month' };
    parts.push(`posted ${dateMap[filters.datePosted]}`);
  }
  
  if (parts.length === 0) return "I've updated the search!";
  return ` Showing ${parts.join(', ')}. Need to adjust?`;
}

// Create LangGraph workflow
function createAssistantGraph() {
  const workflow = new StateGraph(GraphState);
  
  workflow.addNode('detect_intent', detectIntentNode);
  workflow.addNode('extract_filters', extractFiltersNode);
  workflow.addNode('generate_response', generateResponseNode);
  
  workflow.addEdge(START, 'detect_intent');
  workflow.addEdge('detect_intent', 'extract_filters');
  workflow.addEdge('extract_filters', 'generate_response');
  workflow.addEdge('generate_response', END);
  
  return workflow.compile();
}

const graph = createAssistantGraph();

// Main export
export async function chatWithAssistant(message, conversationHistory = []) {
  try {
    const messages = [
      ...conversationHistory.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      ),
      new HumanMessage(message)
    ];
    
    const result = await graph.invoke({ messages });
    
    return {
      response: result.response,
      intent: result.intent,
      filters: result.filters,
      action: result.action
    };
  } catch (error) {
    console.error('Assistant error:', error);
    return {
      response: "I'm having trouble processing that. Could you rephrase?",
      intent: 'ERROR',
      filters: {},
      action: null
    };
  }
}