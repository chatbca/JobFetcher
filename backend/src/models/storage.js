// test marker
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'db.json');

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const defaultJobs = [
  {
    id: 'job-seed-1',
    recruiterId: 'recruiter-1',
    title: 'Senior Frontend Engineer',
    company: 'TC Counstancey Service',
    location: 'Hubballi, Karnataka',
    description: 'Own the design system for internal hiring dashboards and deliver pixel-perfect React flows.',
    skills: ['React', 'TypeScript', 'TailwindCSS'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Senior',
    applyLink: 'https://tc-counstancey.example/jobs/frontend',
    status: 'Open',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
    applicants: 1
  },
  {
    id: 'job-seed-2',
    recruiterId: 'recruiter-1',
    title: 'Platform Reliability Engineer',
    company: 'Namma Mobility Labs',
    location: 'Bengaluru, Karnataka',
    description: 'Keep our ride-hailing platform resilient with infra as code and observability automations.',
    skills: ['Node.js', 'AWS', 'Kubernetes'],
    jobType: 'Full-time',
    workMode: 'On-site',
    experienceLevel: 'Mid',
    applyLink: 'https://namma-mobility.example/careers/pre',
    status: 'Open',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(5),
    applicants: 1
  },
  {
    id: 'job-seed-3',
    recruiterId: 'recruiter-1',
    title: 'Data Product Analyst',
    company: 'Udupi FinInsights',
    location: 'Mangaluru, Karnataka',
    description: 'Work with lending squads to craft dashboards and quantify credit risk experiments.',
    skills: ['SQL', 'Python', 'PowerBI'],
    jobType: 'Contract',
    workMode: 'Remote',
    experienceLevel: 'Junior',
    applyLink: 'https://fininsights.example/apply/data-product',
    status: 'Open',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    applicants: 1
  }
];





const defaultApplications = [
  {
    id: 'app-seed-1',
    userId: '1',
    jobId: 'job-seed-1',
    jobTitle: 'Senior Frontend Engineer',
    company: 'TC Counstancey Service',
    status: 'Interview',
    appliedVia: 'referral',
    appliedDate: daysAgo(8),
    notes: 'Referral from campus alumni meet.',
    matchScore: 84,
    matchDetails: {
      score: 84,
      matchingSkills: ['React', 'TypeScript', 'Design Systems'],
      relevantExperience: '4.5 years building enterprise UI kits.',
      missingRequirements: ['GraphQL'],
      reasoning: 'Strong ownership of component libraries for BFSI teams.'
    },
    resumeSummary: 'Built hiring pods for fintech dashboards at Mysuru-based startup.',
    candidateName: 'Neha Kulkarni',
    candidateEmail: 'neha.kulkarni@example.com',
    recruiterId: 'recruiter-1',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
    timeline: [
      { status: 'Applied', actor: 'candidate', timestamp: daysAgo(8) },
      { status: 'In Progress', actor: 'system', timestamp: daysAgo(6) },
      { status: 'Shortlisted', actor: 'recruiter', timestamp: daysAgo(3) },
      { status: 'Interview', actor: 'recruiter', timestamp: daysAgo(1) }
    ]
  },
  {
    id: 'app-seed-2',
    userId: '1',
    jobId: 'job-seed-2',
    jobTitle: 'Platform Reliability Engineer',
    company: 'Namma Mobility Labs',
    status: 'Offer',
    appliedVia: 'external',
    appliedDate: daysAgo(11),
    notes: 'Available for on-site panel post Sankranti.',
    matchScore: 77,
    matchDetails: {
      score: 77,
      matchingSkills: ['Node.js', 'AWS', 'Terraform'],
      relevantExperience: '3 years running mobility APIs for intercity buses.',
      missingRequirements: ['Prometheus'],
      reasoning: 'Meets core SRE expectations with minor tooling gaps.'
    },
    resumeSummary: 'Scaled observability stack for a Mysuru logistics fleet.',
    candidateName: 'Raghavendra Pai',
    candidateEmail: 'raghav.pai@example.com',
    recruiterId: 'recruiter-1',
    createdAt: daysAgo(11),
    updatedAt: daysAgo(1),
    timeline: [
      { status: 'Applied', actor: 'candidate', timestamp: daysAgo(11) },
      { status: 'In Progress', actor: 'system', timestamp: daysAgo(9) },
      { status: 'Shortlisted', actor: 'recruiter', timestamp: daysAgo(7) },
      { status: 'Interview', actor: 'recruiter', timestamp: daysAgo(4) },
      { status: 'Offer', actor: 'recruiter', timestamp: daysAgo(1) }
    ]
  },
  {
    id: 'app-seed-3',
    userId: '1',
    jobId: 'job-seed-3',
    jobTitle: 'Data Product Analyst',
    company: 'Udupi FinInsights',
    status: 'Hired',
    appliedVia: 'external',
    appliedDate: daysAgo(6),
    notes: 'Happy to relocate for quarterly planning.',
    matchScore: 71,
    matchDetails: {
      score: 71,
      matchingSkills: ['SQL', 'Python', 'Dashboards'],
      relevantExperience: '2.5 years translating lending KPIs for CXOs.',
      missingRequirements: ['PowerBI certification'],
      reasoning: 'Strong analytics storyteller with quant experiments shipped to production.'
    },
    resumeSummary: 'Translates credit insights into interactive stakeholder reports.',
    candidateName: 'Chaitra Desai',
    candidateEmail: 'chaitra.desai@example.com',
    recruiterId: 'recruiter-1',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(0.5),
    timeline: [
      { status: 'Applied', actor: 'candidate', timestamp: daysAgo(6) },
      { status: 'In Progress', actor: 'system', timestamp: daysAgo(5.5) },
      { status: 'Shortlisted', actor: 'recruiter', timestamp: daysAgo(4) },
      { status: 'Interview', actor: 'recruiter', timestamp: daysAgo(3) },
      { status: 'Offer', actor: 'recruiter', timestamp: daysAgo(1.2) },
      { status: 'Hired', actor: 'recruiter', timestamp: daysAgo(0.5) }
    ]
  }
];

const defaultData = {
  users: [
    {
      id: '1',
      name: 'Neha Kulkarni',
      email: 'test@gmail.com',
      password: 'test@123',
      resume: null,
      resumeText: '',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2)
    }
  ],
  recruiters: [
    {
      id: 'recruiter-1',
      name: 'Alex Recruiter',
      email: 'admin@company.com',
      password: 'admin@123',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5)
    }
  ],
  jobs: defaultJobs,
  applications: defaultApplications
};

let cache = null;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function writeDefaultData() {
  ensureDataDir();
  fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2), 'utf-8');
}

export function initDataStore() {
  ensureDataDir();
  if (!fs.existsSync(dataFile)) {
    writeDefaultData();
  }
  cache = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  return cache;
}

export function getData() {
  if (!cache) {
    initDataStore();
  }
  return cache;
}

export function saveData(data = cache) {
  if (!data) {
    return;
  }
  cache = data;
  fs.writeFileSync(dataFile, JSON.stringify(cache, null, 2), 'utf-8');
}

export function updateData(mutator) {
  const data = getData();
  mutator(data);
  saveData(data);
  return data;
}

