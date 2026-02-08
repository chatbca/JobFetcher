import axios from "axios";
import { getActiveRecruiterJobs } from "../models/data.js";

const mockJobs = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "Tech Corp",
    location: "Remote",
    description:
      "Looking for an experienced React developer with strong skills in TypeScript, Redux, and modern frontend development. Must have 5+ years of experience building scalable web applications.",
    jobType: "Full-time",
    workMode: "Remote",
    skills: ["React", "TypeScript", "Redux", "JavaScript", "Node.js", "CSS"],
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/1",
    salary: "$120k -$160k"
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    description:
      "Join our dynamic team as a Full Stack Engineer. Work with React, Node.js, Python, and PostgreSQL to build cutting-edge products. Experience with AI/ML is a plus.",
    jobType: "Full-time",
    workMode: "Hybrid",
    skills: ["React", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/2",
    salary: "$110k - $150k"
  },
  {
    id: "3",
    title: "Frontend Developer",
    company: "Design Studio",
    location: "New York, NY",
    description:
      "Creative frontend developer needed to build beautiful, responsive web applications. Strong CSS and JavaScript skills required. Experience with React or Vue.js preferred.",
    jobType: "Contract",
    workMode: "On-site",
    skills: ["JavaScript", "React", "CSS", "HTML", "Vue.js", "Figma"],
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/3",
    salary: "$80 - $100/hr"
  },
  {
    id: "4",
    title: "Backend Engineer - Python",
    company: "Data Analytics Inc",
    location: "Austin, TX",
    description:
      "Backend engineer with strong Python skills. Work on data processing pipelines, APIs, and microservices. Experience with Django, FastAPI, and cloud platforms required.",
    jobType: "Full-time",
    workMode: "Remote",
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "AWS"],
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/4",
    salary: "$115k - $145k"
  },
  {
    id: "5",
    title: "ML Engineer",
    company: "AI Innovations",
    location: "Remote",
    description:
      "Machine Learning Engineer to build and deploy ML models. Strong Python skills, experience with PyTorch, TensorFlow, and production ML systems required.",
    jobType: "Full-time",
    workMode: "Remote",
    skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Docker", "Kubernetes"],
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/5",
    salary: "$130k - $180k"
  },
  {
    id: "6",
    title: "DevOps Engineer",
    company: "Cloud Services Ltd",
    location: "Seattle, WA",
    description:
      "DevOps engineer to manage cloud infrastructure and CI/CD pipelines. AWS, Docker, Kubernetes, and Terraform experience required.",
    jobType: "Full-time",
    workMode: "Hybrid",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "Linux"],
    datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/6",
    salary: "$125k - $155k"
  },
  {
    id: "7",
    title: "UI/UX Designer & Developer",
    company: "Creative Agency",
    location: "Los Angeles, CA",
    description:
      "Hybrid role combining UI/UX design with frontend development. Create beautiful designs and implement them in React. Figma and design system experience required.",
    jobType: "Part-time",
    workMode: "Remote",
    skills: ["React", "Figma", "CSS", "JavaScript", "UI/UX Design", "TypeScript"],
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/7",
    salary: "$60 - $80/hr"
  },
  {
    id: "8",
    title: "Software Engineering Intern",
    company: "BigTech Corp",
    location: "Mountain View, CA",
    description:
      "Summer internship for aspiring software engineers. Work on real projects with React, Node.js, and Python. Great learning opportunity.",
    jobType: "Internship",
    workMode: "On-site",
    skills: ["React", "Node.js", "Python", "Git", "JavaScript"],
    datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/8",
    salary: "$35/hour"
  },
  {
    id: "9",
    title: "Senior Node.js Developer",
    company: "Fintech Solutions",
    location: "Chicago, IL",
    description:
      "Backend developer specializing in Node.js and microservices architecture. Build scalable financial applications. Experience with TypeScript and event-driven systems required.",
    jobType: "Full-time",
    workMode: "Hybrid",
    skills: ["Node.js", "TypeScript", "MongoDB", "Redis", "Microservices", "Kafka"],
    datePosted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/9",
    salary: "$135k - $170k"
  },
  {
    id: "10",
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Boston, MA",
    description:
      "Data scientist to analyze large datasets and build predictive models. Python, SQL, machine learning, and data visualization skills required.",
    jobType: "Full-time",
    workMode: "Remote",
    skills: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn", "Tableau"],
    datePosted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: "https://example.com/apply/10",
    salary: "$120k - $160k"
  }
];

export async function fetchJobs(filters = {}) {
  const recruiterJobs = filterJobs(getActiveRecruiterJobs().map(formatRecruiterJob), filters);
  const externalJobs = await fetchExternalJobs(filters);
  return [...recruiterJobs, ...externalJobs];
}

async function fetchExternalJobs(filters = {}) {
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY) {
    try {
      return await fetchFromAdzuna(filters);
    } catch (error) {
      console.log("Adzuna API error, using mock data:", error.message);
    }
  }
  return filterJobs(mockJobs, filters);
}

async function fetchFromAdzuna(filters = {}) {
  const { location = "us", query = "developer" } = filters;
  const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1`;

  const response = await axios.get(url, {
    params: {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_API_KEY,
      results_per_page: 50,
      what: query
    }
  });

  return response.data.results
    .map((job, index) => ({
      id: job.id || `adzuna-${index}`,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      jobType: "Full-time",
      workMode: "On-site",
      skills: extractSkills(job.description),
      datePosted: job.created,
      applyUrl: job.redirect_url,
      salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : "Not specified"
    }))
    .filter((job) => jobMatchesFilters(job, filters));
}

const filterJobs = (jobs, filters) => jobs.filter((job) => jobMatchesFilters(job, filters));

function jobMatchesFilters(job, filters) {
  let isMatch = true;

  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    isMatch =
      isMatch &&
      (job.title.toLowerCase().includes(queryLower) || job.description.toLowerCase().includes(queryLower));
  }

  if (filters.skills && filters.skills.length > 0) {
    const jobSkills = (job.skills || []).map((skill) => skill.toLowerCase());
    const requestedSkills = filters.skills.map((skill) => skill.toLowerCase());
    isMatch = isMatch && requestedSkills.some((skill) => jobSkills.includes(skill));
  }

  if (filters.datePosted) {
    const now = Date.now();
    const cutoffs = {
      "24h": now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000
    };
    if (cutoffs[filters.datePosted]) {
      isMatch = isMatch && new Date(job.datePosted).getTime() >= cutoffs[filters.datePosted];
    }
  }

  if (filters.jobType) {
    isMatch = isMatch && job.jobType?.toLowerCase() === filters.jobType.toLowerCase();
  }

  if (filters.workMode) {
    isMatch = isMatch && job.workMode?.toLowerCase() === filters.workMode.toLowerCase();
  }

  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    isMatch =
      isMatch &&
      (job.location?.toLowerCase().includes(locationLower) ||
        (locationLower === "remote" && job.workMode?.toLowerCase() === "remote"));
  }

  return isMatch;
}

function extractSkills(description) {
  const commonSkills = [
    "React",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "AWS",
    "Docker",
    "Kubernetes",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Vue.js",
    "Angular",
    "Django",
    "FastAPI",
    "Machine Learning",
    "TensorFlow",
    "PyTorch"
  ];

  const found = [];
  const lowerDesc = description.toLowerCase();

  for (const skill of commonSkills) {
    if (lowerDesc.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  return found;
}

const formatRecruiterJob = (job) => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location: job.location,
  description: job.description,
  jobType: job.jobType,
  workMode: job.workMode,
  skills: job.skills || [],
  datePosted: job.updatedAt || job.createdAt,
  applyUrl: job.applyLink || "",
  applyLink: job.applyLink || "",
  salary: job.salary || "Not specified",
  experienceLevel: job.experienceLevel,
  status: job.status,
  applicants: job.applicants || 0,
  source: "recruiter"
});

export { mockJobs };
