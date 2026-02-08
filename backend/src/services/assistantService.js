import dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

import { fetchJobs } from './jobService.js';
import { batchMatchJobs } from './matchingService.js';
import { findUserByEmail } from '../models/data.js';

const DEFAULT_USER_EMAIL = 'test@gmail.com';
const MAX_JOB_SUMMARY = 3;

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
    console.log('Gemini AI (LangGraph) initialized');
  } else {
    console.log('No Gemini API key - using rule-based assistant');
  }
} catch (error) {
  console.log('Gemini initialization failed - using rule-based assistant');
  aiEnabled = false;
}

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
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => ({})
  }),
  filterUpdate: Annotation({
    reducer: (x, y) => ({ ...x, ...(y || {}) }),
    default: () => ({})
  }),
  action: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null
  }),
  response: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ''
  }),
  jobs: Annotation({
    reducer: (x, y) => (Array.isArray(y) ? y : x),
    default: () => []
  })
});

async function detectIntentNode(state) {
  const userMessage = state.messages[state.messages.length - 1].content;

  if (!aiEnabled || !llm) {
    return { intent: detectIntentRuleBased(userMessage) };
  }

  try {
    const prompt = `You are an AI assistant for a job tracking app. Classify the user's intent with ONE of these labels:
FILTER_UPDATE (user wants to change filters like remote, location, job type, date, match score)
JOB_SEARCH (user wants to find roles, titles, skills, tech stacks)
HELP (general product question)
APPLICATIONS (questions about their applications)
RESUME (questions about resume upload/usage)

User message: "${userMessage}"

Respond with only the label.`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const intent = response.content.trim().toUpperCase();
    const supported = ['FILTER_UPDATE', 'JOB_SEARCH', 'HELP', 'APPLICATIONS', 'RESUME'];
    return { intent: supported.includes(intent) ? intent : 'JOB_SEARCH' };
  } catch (error) {
    console.error('Intent detection error:', error.message);
    return { intent: detectIntentRuleBased(userMessage) };
  }
}

async function handleSupportNode(state) {
  const userMessage = state.messages[state.messages.length - 1].content;
  let responseText = '';

  switch (state.intent) {
    case 'APPLICATIONS':
      responseText = 'Open the Applications tab (top navigation) to review every submission, status change, and recruiter note. I keep the timeline in sync so you always know what to follow up on.';
      break;
    case 'RESUME':
      responseText = 'Upload your resume from the profile menu -> Upload Resume. PDF or TXT works best. Once it is stored, I can calculate match scores and surface the strongest roles automatically.';
      break;
    default:
      responseText = generateHelpResponse(userMessage);
  }

  return {
    response: responseText,
    action: 'inform',
    filterUpdate: {},
    jobs: []
  };
}

async function extractFiltersNode(state) {
  const userMessage = state.messages[state.messages.length - 1].content;
  const baseFilters = state.filters || {};

  let extracted = {};

  if (aiEnabled && llm) {
    try {
      extracted = await extractFiltersWithLLM(userMessage);
    } catch (error) {
      console.error('Filter extraction (LLM) error:', error.message);
      extracted = extractFiltersRuleBased(userMessage);
    }
  } else {
    extracted = extractFiltersRuleBased(userMessage);
  }

  const normalizedUpdate = normalizeFilterPayload(extracted, userMessage, state.intent);
  const nextFilters = applyFilterUpdate(baseFilters, normalizedUpdate);
  const shouldApply = normalizedUpdate.clear || Object.keys(normalizedUpdate).length > 0;

  return {
    filters: nextFilters,
    filterUpdate: normalizedUpdate,
    action: shouldApply ? 'apply_filters' : state.action
  };
}

async function searchJobsNode(state) {
  const activeFilters = state.filters || {};

  try {
    let jobs = await fetchJobs(activeFilters);
    const user = findUserByEmail(DEFAULT_USER_EMAIL);

    if (user?.resumeText) {
      jobs = await batchMatchJobs(user.resumeText, jobs);
    } else {
      jobs = jobs.map(job => ({
        ...job,
        matchScore: job.matchScore ?? 0,
        matchDetails: job.matchDetails || {
          score: 0,
          matchingSkills: [],
          relevantExperience: 'Upload your resume to unlock match scoring',
          missingRequirements: job.skills || [],
          reasoning: ''
        }
      }));
    }

    jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    const topJobs = jobs.slice(0, MAX_JOB_SUMMARY);

    return {
      jobs: topJobs,
      action: 'apply_filters'
    };
  } catch (error) {
    console.error('Job search error:', error.message);
    return {
      jobs: [],
      response: "I couldn't fetch jobs right now. Please try again in a moment.",
      action: 'apply_filters'
    };
  }
}

function finalizeResponseNode(state) {
  if (state.response) {
    return {};
  }

  if (state.action === 'apply_filters') {
    const filterNote = describeFilters(state.filterUpdate, state.filters);
    const jobSummary = formatJobResponse(state.jobs, state.filters);
    const sections = [filterNote, jobSummary].filter(Boolean);
    return { response: sections.join('\n\n') };
  }

  return {
    response: "I'm ready to help with searches, filters, applications, or resume questions."
  };
}

function detectIntentRuleBased(message) {
  const lower = message.toLowerCase();
  if (lower.includes('help') || lower.includes('how do') || lower.includes('what is')) return 'HELP';
  if (lower.includes('application') || lower.includes('applied') || lower.includes('my jobs')) return 'APPLICATIONS';
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('upload')) return 'RESUME';
  if (
    lower.includes('remote') ||
    lower.includes('filter') ||
    lower.includes('show me') ||
    lower.includes('find') ||
    lower.includes('only') ||
    lower.includes('location') ||
    lower.includes('full-time') ||
    lower.includes('part-time') ||
    lower.includes('hybrid') ||
    lower.includes('clear')
  ) {
    return 'FILTER_UPDATE';
  }
  return 'JOB_SEARCH';
}

async function extractFiltersWithLLM(message) {
  const prompt = `Extract job-search filters from this message. Return ONLY JSON with any of these keys if mentioned:
{
  "workMode": "Remote" | "Hybrid" | "On-site",
  "jobType": "Full-time" | "Part-time" | "Contract" | "Internship",
  "datePosted": "24h" | "week" | "month",
  "location": "string",
  "skills": ["skill1", "skill2"],
  "query": "role or keywords",
  "matchScore": "high" | "medium" | "all",
  "clear": true
}

Message: "${message}"

Return ONLY valid JSON.`;

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return {};
}

function extractFiltersRuleBased(message) {
  const lower = message.toLowerCase();
  const filters = {};

  if (lower.includes('remote')) filters.workMode = 'Remote';
  if (lower.includes('hybrid')) filters.workMode = 'Hybrid';
  if (lower.includes('on-site') || lower.includes('onsite')) filters.workMode = 'On-site';

  if (lower.includes('full-time') || lower.includes('full time')) filters.jobType = 'Full-time';
  if (lower.includes('part-time') || lower.includes('part time')) filters.jobType = 'Part-time';
  if (lower.includes('contract')) filters.jobType = 'Contract';
  if (lower.includes('internship') || lower.includes('intern')) filters.jobType = 'Internship';

  if (lower.includes('24 hours') || lower.includes('last 24') || lower.includes('today')) filters.datePosted = '24h';
  if (lower.includes('this week') || lower.includes('past week') || lower.includes('7 days')) filters.datePosted = 'week';
  if (lower.includes('month') || lower.includes('30 days')) filters.datePosted = 'month';

  if (lower.includes('high match')) filters.matchScore = 'high';
  if (lower.includes('medium match')) filters.matchScore = 'medium';
  if (lower.includes('clear') || lower.includes('reset')) filters.clear = true;

  const location = inferLocationFromMessage(message);
  if (location) filters.location = location;

  const query = inferQueryFromMessage(message);
  if (query) filters.query = query;

  const skillKeywords = [
    'react', 'node', 'node.js', 'nodejs', 'javascript', 'typescript', 'python', 'java', 'go',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql', 'redis',
    'pytorch', 'tensorflow', 'machine learning', 'ml', 'frontend', 'backend', 'full stack',
    'vue', 'angular', 'django', 'fastapi'
  ];

  const foundSkills = skillKeywords.filter(skill => lower.includes(skill));
  if (foundSkills.length > 0) {
    filters.skills = dedupeSkills(foundSkills);
  }

  return filters;
}

function normalizeFilterPayload(rawFilters = {}, message, intent) {
  if (!rawFilters || Object.keys(rawFilters).length === 0) {
    const fallbackQuery = intent === 'JOB_SEARCH' ? inferQueryFromMessage(message) : null;
    return fallbackQuery ? { query: fallbackQuery } : {};
  }

  if (rawFilters.clear) {
    return { clear: true };
  }

  const normalized = {};

  if (rawFilters.workMode) {
    const value = capitalizeWords(rawFilters.workMode);
    const accepted = ['Remote', 'Hybrid', 'On-site'];
    if (accepted.includes(value)) {
      normalized.workMode = value;
    }
  }

  if (rawFilters.jobType) {
    const value = capitalizeWords(rawFilters.jobType);
    const accepted = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    if (accepted.includes(value)) {
      normalized.jobType = value;
    }
  }

  if (rawFilters.datePosted) {
    const accepted = ['24h', 'week', 'month'];
    if (accepted.includes(rawFilters.datePosted)) {
      normalized.datePosted = rawFilters.datePosted;
    }
  }

  if (rawFilters.location) {
    normalized.location = capitalizeWords(rawFilters.location);
  }

  if (rawFilters.matchScore) {
    const allowed = ['high', 'medium', 'all'];
    if (allowed.includes(rawFilters.matchScore)) {
      normalized.matchScore = rawFilters.matchScore;
    }
  }

  if (rawFilters.skills) {
    normalized.skills = dedupeSkills(rawFilters.skills);
  }

  if (rawFilters.query) {
    normalized.query = cleanupQueryText(rawFilters.query);
  } else if (intent === 'JOB_SEARCH') {
    const inferred = inferQueryFromMessage(message);
    if (inferred) normalized.query = inferred;
  }

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    })
  );
}

function applyFilterUpdate(currentFilters = {}, update = {}) {
  if (!update || Object.keys(update).length === 0) {
    return currentFilters;
  }

  if (update.clear) {
    return {};
  }

  const next = { ...currentFilters };
  let mutated = false;

  for (const [key, value] of Object.entries(update)) {
    if (key === 'clear') continue;

    const shouldRemove =
      value === '' ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (key === 'matchScore' && value === 'all');

    if (shouldRemove) {
      if (key in next) {
        delete next[key];
        mutated = true;
      }
      continue;
    }

    if (Array.isArray(value)) {
      next[key] = [...value];
    } else {
      next[key] = value;
    }
    mutated = true;
  }

  return mutated ? next : currentFilters;
}

function describeFilters(filterUpdate = {}, filters = {}) {
  if (filterUpdate.clear) {
    return 'Cleared every filter and showing the full job list again.';
  }

  const parts = [];
  if (filterUpdate.query) parts.push(`role -> ${filterUpdate.query}`);
  if (filterUpdate.skills?.length) parts.push(`skills -> ${filterUpdate.skills.join(', ')}`);
  if (filterUpdate.workMode) parts.push(`work mode -> ${filterUpdate.workMode}`);
  if (filterUpdate.jobType) parts.push(`job type -> ${filterUpdate.jobType}`);
  if (filterUpdate.location) parts.push(`location -> ${filterUpdate.location}`);
  if (filterUpdate.datePosted) {
    const map = { '24h': 'last 24 hours', week: 'this week', month: 'this month' };
    parts.push(`date -> ${map[filterUpdate.datePosted] || filterUpdate.datePosted}`);
  }
  if (filterUpdate.matchScore) {
    if (filterUpdate.matchScore === 'high') parts.push('match score -> 70%+');
    else if (filterUpdate.matchScore === 'medium') parts.push('match score -> 40-70%');
    else if (filterUpdate.matchScore === 'all') parts.push('match score -> all');
  }

  if (parts.length === 0) {
    const summary = summarizeActiveFilters(filters);
    return summary ? `Keeping your current filters (${summary}).` : '';
  }

  return `Applied filters: ${parts.join(', ')}.`;
}

function summarizeActiveFilters(filters = {}) {
  const parts = [];
  if (filters.query) parts.push(`${filters.query} roles`);
  if (filters.skills?.length) parts.push(`skills: ${filters.skills.join(', ')}`);
  if (filters.workMode) parts.push(filters.workMode);
  if (filters.jobType) parts.push(filters.jobType);
  if (filters.location) parts.push(`in ${filters.location}`);
  if (filters.datePosted) {
    const map = { '24h': 'posted in the last 24 hours', week: 'posted this week', month: 'posted this month' };
    parts.push(map[filters.datePosted]);
  }
  if (filters.matchScore === 'high') parts.push('match score above 70%');
  if (filters.matchScore === 'medium') parts.push('match score 40-70%');
  return parts.length ? parts.join(', ') : '';
}

function formatJobResponse(jobs = [], filters = {}) {
  if (!jobs.length) {
    const summary = summarizeActiveFilters(filters);
    const base = summary ? `I could not find matches for ${summary}.` : "I couldn't find matching roles right now.";
    return `${base} Try adjusting the filters or ask me to clear them.`;
  }

  const intro = summarizeActiveFilters(filters)
    ? `Here are the best matches for ${summarizeActiveFilters(filters)}:`
    : 'Here are a few roles that look promising:';

  const lines = jobs.map(job => {
    const score = job.matchScore !== undefined && job.matchScore !== null ? `${Math.round(job.matchScore)}% match` : 'match score pending';
    const location = job.workMode ? `${job.workMode}${job.location ? ` / ${job.location}` : ''}` : (job.location || 'Location TBD');
    return `- ${job.title} @ ${job.company} | ${score} (${location})`;
  });

  return `${intro}\n${lines.join('\n')}\nI updated the job list so you can review these results in the main view.`;
}

function generateHelpResponse(query) {
  const helpTopics = {
    resume: 'Use the profile menu -> Upload Resume to add a PDF/TXT resume. I read it to power match scores and recommendations.',
    applications: 'Open the Applications tab to review submissions, recruiter feedback, and the status timeline (Applied -> Interview -> Offer/Rejected).',
    matching: 'Match scores (0-100%) combine skill overlap, role fit, and resume keywords. Green cards (>70%) are the strongest leads.',
    filters: 'Use the left sidebar (or just ask me) to filter by role, skills, work mode, location, match score, and posted date.',
    apply: 'Hit Apply on any job card. After you return, I can log the application so the tracker stays in sync.'
  };

  const lower = query.toLowerCase();
  for (const [key, value] of Object.entries(helpTopics)) {
    if (lower.includes(key)) return value;
  }

  return 'I can help you search for jobs, tweak filters, explain match scores, or point you to applications/resume settings. What do you need?';
}

function inferQueryFromMessage(message) {
  const lower = message.toLowerCase();
  const rolePatterns = [
    { regex: /(senior\s+backend|backend\s+engineer|backend\s+developer)/, value: 'Backend Developer' },
    { regex: /(frontend|front-end)/, value: 'Frontend Developer' },
    { regex: /(full\s*stack)/, value: 'Full Stack Developer' },
    { regex: /(react\s+developer|react\s+engineer)/, value: 'React Developer' },
    { regex: /(node\.js|nodejs|node js)/, value: 'Node.js Developer' },
    { regex: /(machine learning|ml\s+engineer)/, value: 'Machine Learning Engineer' },
    { regex: /(data\s+scientist)/, value: 'Data Scientist' },
    { regex: /(devops|site reliability|sre)/, value: 'DevOps Engineer' }
  ];

  for (const pattern of rolePatterns) {
    if (pattern.regex.test(lower)) {
      return pattern.value;
    }
  }

  const phraseMatch = lower.match(/(?:show|find|search|get)\s+(?:me\s+)?(.+?)(?:\s+(?:jobs|roles|positions))/);
  if (phraseMatch && phraseMatch[1]) {
    return cleanupQueryText(phraseMatch[1]);
  }

  const genericMatch = lower.match(/(.+?)\s+(?:jobs|roles)/);
  if (genericMatch && genericMatch[1]) {
    return cleanupQueryText(genericMatch[1]);
  }

  return null;
}

function cleanupQueryText(text) {
  if (!text) return '';
  let result = text;
  result = result.replace(/with .*/i, '');
  result = result.replace(/using .*/i, '');
  result = result.replace(/posted .*/i, '');
  result = result.replace(/only.*/i, '');
  result = result.replace(/remote|hybrid|on-site|onsite|full-time|part-time|contract|internship/gi, '');
  result = result.replace(/\b(in|at)\b.*$/i, '');
  result = result.replace(/\b(and|or)\b/gi, ' ');
  result = result.replace(/[^a-zA-Z\s]/g, ' ');
  result = result.replace(/\s+/g, ' ').trim();
  return capitalizeWords(result).trim();
}

function inferLocationFromMessage(message) {
  const locationMatch = message.match(/(?:in|at)\s+([A-Za-z\s,]+)/i);
  if (locationMatch && locationMatch[1]) {
    return capitalizeWords(locationMatch[1].split(/(?:with|using|for|that)/i)[0].trim());
  }

  const knownLocations = ['san francisco', 'new york', 'austin', 'seattle', 'chicago', 'boston', 'bangalore', 'bengaluru', 'london', 'toronto'];
  const lower = message.toLowerCase();
  for (const city of knownLocations) {
    if (lower.includes(city)) {
      return capitalizeWords(city);
    }
  }

  return null;
}

function dedupeSkills(skills = []) {
  const canonical = {
    'node.js': 'Node.js',
    node: 'Node.js',
    nodejs: 'Node.js',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    react: 'React',
    vue: 'Vue.js',
    angular: 'Angular',
    'machine learning': 'Machine Learning',
    ml: 'Machine Learning',
    pytorch: 'PyTorch',
    tensorflow: 'TensorFlow',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    aws: 'AWS',
    azure: 'Azure',
    gcp: 'GCP',
    sql: 'SQL',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    redis: 'Redis',
    django: 'Django',
    fastapi: 'FastAPI'
  };

  const seen = new Set();
  const normalized = [];

  skills.forEach(skill => {
    const key = skill.toLowerCase().trim();
    const label = canonical[key] || capitalizeWords(skill);
    if (!seen.has(label.toLowerCase())) {
      seen.add(label.toLowerCase());
      normalized.push(label);
    }
  });

  return normalized;
}

function capitalizeWords(text = '') {
  return text
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createAssistantGraph() {
  const workflow = new StateGraph(GraphState);

  workflow.addNode('detect_intent', detectIntentNode);
  workflow.addNode('handle_support', handleSupportNode);
  workflow.addNode('extract_filters', extractFiltersNode);
  workflow.addNode('search_jobs', searchJobsNode);
  workflow.addNode('generate_response', finalizeResponseNode);

  workflow.addEdge(START, 'detect_intent');

  workflow.addConditionalEdges('detect_intent', state => {
    if (['HELP', 'APPLICATIONS', 'RESUME'].includes(state.intent)) {
      return 'handle_support';
    }
    return 'extract_filters';
  });

  workflow.addConditionalEdges('handle_support', () => 'generate_response');

  workflow.addConditionalEdges('extract_filters', state => {
    if (['FILTER_UPDATE', 'JOB_SEARCH'].includes(state.intent)) {
      return 'search_jobs';
    }
    return 'generate_response';
  });

  workflow.addEdge('search_jobs', 'generate_response');
  workflow.addEdge('generate_response', END);

  return workflow.compile();
}

const graph = createAssistantGraph();

export async function chatWithAssistant(message, conversationHistory = [], context = {}) {
  try {
    const messages = [
      ...conversationHistory.map(msg =>
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      ),
      new HumanMessage(message)
    ];

    const initialFilters = context.filters || {};
    const result = await graph.invoke({
      messages,
      filters: initialFilters,
      filterUpdate: {}
    });

    return {
      response: result.response,
      intent: result.intent,
      filters: result.filterUpdate || {},
      action: result.action,
      jobs: serializeJobs(result.jobs || []),
      sessionFilters: result.filters || initialFilters
    };
  } catch (error) {
    console.error('Assistant error:', error);
    return {
      response: "I'm having trouble processing that. Could you rephrase?",
      intent: 'ERROR',
      filters: {},
      action: null,
      jobs: [],
      sessionFilters: context.filters || {}
    };
  }
}

function serializeJobs(jobs = []) {
  return jobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    workMode: job.workMode,
    matchScore: job.matchScore,
    applyUrl: job.applyUrl || job.applyLink
  }));
}
