import { fetchJobs } from '../services/jobService.js';
import { batchMatchJobs } from '../services/matchingService.js';
import { findUserByEmail } from '../models/data.js';

export default async function jobRoutes(fastify, options) {
  // Get all jobs with optional filtering
  fastify.get('/', async (request, reply) => {
    const { query, skills, datePosted, jobType, workMode, location, matchScore } = request.query;
    
    // Fetch jobs with filters
    const filters = {
      query,
      skills: skills ? skills.split(',') : undefined,
      datePosted,
      jobType,
      workMode,
      location
    };
    
    let jobs = await fetchJobs(filters);
    
    // Get user's resume for matching
    const user = findUserByEmail('test@gmail.com');
    const resumeText = user?.resumeText || '';
    
    // Calculate match scores
    if (resumeText) {
      jobs = await batchMatchJobs(resumeText, jobs);
    } else {
      jobs = jobs.map(job => ({
        ...job,
        matchScore: 0,
        matchDetails: {
          score: 0,
          matchingSkills: [],
          relevantExperience: 'No resume uploaded',
          missingRequirements: job.skills || [],
          reasoning: 'Upload your resume to see match scores'
        }
      }));
    }
    
    // Filter by match score if requested
    if (matchScore === 'high') {
      jobs = jobs.filter(job => job.matchScore > 70);
    } else if (matchScore === 'medium') {
      jobs = jobs.filter(job => job.matchScore >= 40 && job.matchScore <= 70);
    }
    
    // Sort by match score
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    
    return {
      jobs,
      total: jobs.length,
      bestMatches: jobs.slice(0, 8)
    };
  });
  
  // Get single job details
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const jobs = await fetchJobs({});
    const job = jobs.find(j => j.id === id);
    
    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    // Calculate match score
    const user = findUserByEmail('test@gmail.com');
    if (user?.resumeText) {
      const [matchedJob] = await batchMatchJobs(user.resumeText, [job]);
      return matchedJob;
    }
    
    return job;
  });
}
