import axios from 'axios';

// Mock jobs data (in case external API is not available)
const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Tech Corp',
    location: 'Remote',
    description: 'Looking for an experienced React developer with strong skills in TypeScript, Redux, and modern frontend development. Must have 5+ years of experience building scalable web applications.',
    jobType: 'Full-time',
    workMode: 'Remote',
    skills: ['React', 'TypeScript', 'Redux', 'JavaScript', 'Node.js', 'CSS'],
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/1',
    salary: '$120k -$160k'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'San Francisco, CA',
    description: 'Join our dynamic team as a Full Stack Engineer. Work with React, Node.js, Python, and PostgreSQL to build cutting-edge products. Experience with AI/ML is a plus.',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/2',
    salary: '$110k - $150k'
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Design Studio',
    location: 'New York, NY',
    description: 'Creative frontend developer needed to build beautiful, responsive web applications. Strong CSS and JavaScript skills required. Experience with React or Vue.js preferred.',
    jobType: 'Contract',
    workMode: 'On-site',
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Vue.js', 'Figma'],
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/3',
    salary: '$80 - $100/hr'
  },
  {
    id: '4',
    title: 'Backend Engineer - Python',
    company: 'Data Analytics Inc',
    location: 'Austin, TX',
    description: 'Backend engineer with strong Python skills. Work on data processing pipelines, APIs, and microservices. Experience with Django, FastAPI, and cloud platforms required.',
    jobType: 'Full-time',
    workMode: 'Remote',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS'],
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/4',
    salary: '$115k - $145k'
  },
  {
    id: '5',
    title: 'ML Engineer',
    company: 'AI Innovations',
    location: 'Remote',
    description: 'Machine Learning Engineer to build and deploy ML models. Strong Python skills, experience with PyTorch, TensorFlow, and production ML systems required.',
    jobType: 'Full-time',
    workMode: 'Remote',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Docker', 'Kubernetes'],
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/5',
    salary: '$130k - $180k'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Cloud Services Ltd',
    location: 'Seattle, WA',
    description: 'DevOps engineer to manage cloud infrastructure and CI/CD pipelines. AWS, Docker, Kubernetes, and Terraform experience required.',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python', 'Linux'],
    datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/6',
    salary: '$125k - $155k'
  },
  {
    id: '7',
    title: 'UI/UX Designer & Developer',
    company: 'Creative Agency',
    location: 'Los Angeles, CA',
    description: 'Hybrid role combining UI/UX design with frontend development. Create beautiful designs and implement them in React. Figma and design system experience required.',
    jobType: 'Part-time',
    workMode: 'Remote',
    skills: ['React', 'Figma', 'CSS', 'JavaScript', 'UI/UX Design', 'TypeScript'],
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/7',
    salary: '$60 - $80/hr'
  },
  {
    id: '8',
    title: 'Software Engineering Intern',
    company: 'BigTech Corp',
    location: 'Mountain View, CA',
    description: 'Summer internship for aspiring software engineers. Work on real projects with React, Node.js, and Python. Great learning opportunity.',
    jobType: 'Internship',
    workMode: 'On-site',
    skills: ['React', 'Node.js', 'Python', 'Git', 'JavaScript'],
    datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/8',
    salary: '$35/hour'
  },
  {
    id: '9',
    title: 'Senior Node.js Developer',
    company: 'Fintech Solutions',
    location: 'Chicago, IL',
    description: 'Backend developer specializing in Node.js and microservices architecture. Build scalable financial applications. Experience with TypeScript and event-driven systems required.',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    skills: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Microservices', 'Kafka'],
    datePosted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/9',
    salary: '$135k - $170k'
  },
  {
    id: '10',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Boston, MA',
    description: 'Data scientist to analyze large datasets and build predictive models. Python, SQL, machine learning, and data visualization skills required.',
    jobType: 'Full-time',
    workMode: 'Remote',
    skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Scikit-learn', 'Tableau'],
    datePosted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/10',
    salary: '$120k - $160k'
  }
];

export async function fetchJobs(filters = {}) {
  // Try to fetch from Adzuna API if credentials are available
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY) {
    try {
      return await fetchFromAdzuna(filters);
    } catch (error) {
      console.log('Adzuna API error, using mock data:', error.message);
    }
  }
  
  // Return mock jobs with filtering
  return filterMockJobs(mockJobs, filters);
}

async function fetchFromAdzuna(filters = {}) {
  const { location = 'us', query = 'developer' } = filters;
  const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1`;
  
  const response = await axios.get(url, {
    params: {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_API_KEY,
      results_per_page: 50,
      what: query
    }
  });
  
  // Transform Adzuna jobs to our format
  return response.data.results.map((job, index) => ({
    id: job.id || `adzuna-${index}`,
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    description: job.description,
    jobType: 'Full-time', // Adzuna doesn't always provide this
    workMode: 'On-site', // Default
    skills: extractSkills(job.description),
    datePosted: job.created,
    applyUrl: job.redirect_url,
    salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Not specified'
  }));
}

function extractSkills(description) {
  const commonSkills = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 
    'Java', 'C++', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 
    'PostgreSQL', 'Redis', 'Vue.js', 'Angular', 'Django', 'FastAPI', 
    'Machine Learning', 'TensorFlow', 'PyTorch'];
  
  const found = [];
  const lowerDesc = description.toLowerCase();
  
  for (const skill of commonSkills) {
    if (lowerDesc.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  
  return found;
}

function filterMockJobs(jobs, filters) {
  let filtered = [...jobs];
  
  // Filter by title/role
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by skills
  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter(job =>
      filters.skills.some(skill => 
        job.skills.some(js => js.toLowerCase() === skill.toLowerCase())
      )
    );
  }
  
  // Filter by date
  if (filters.datePosted) {
    const now = Date.now();
    const cutoffs = {
      '24h': now - 24 * 60 * 60 * 1000,
      'week': now - 7 * 24 * 60 * 60 * 1000,
      'month': now - 30 * 24 * 60 * 60 * 1000
    };
    
    if (cutoffs[filters.datePosted]) {
      filtered = filtered.filter(job => 
        new Date(job.datePosted).getTime() >= cutoffs[filters.datePosted]
      );
    }
  }
  
  // Filter by job type
  if (filters.jobType) {
    filtered = filtered.filter(job => 
      job.jobType.toLowerCase() === filters.jobType.toLowerCase()
    );
  }
  
  // Filter by work mode
  if (filters.workMode) {
    filtered = filtered.filter(job => 
      job.workMode.toLowerCase() === filters.workMode.toLowerCase()
    );
  }
  
  // Filter by location
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    filtered = filtered.filter(job => 
      job.location.toLowerCase().includes(loc) ||
      (loc === 'remote' && job.workMode.toLowerCase() === 'remote')
    );
  }
  
  return filtered;
}

export { mockJobs };
