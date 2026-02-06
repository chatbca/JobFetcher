import dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-pro',
  temperature: 0.3,
  apiKey: process.env.GOOGLE_API_KEY
});

const matchingPrompt = PromptTemplate.fromTemplate(`
You are an AI job matching expert. Analyze a candidate's resume and a job description to calculate a match score.

Resume:
{resumeText}

Job Title: {jobTitle}
Company: {company}
Job Description: {jobDescription}
Required Skills: {skills}

Task:
1. Calculate a match score from 0-100 based on:
   - Skills alignment (40%)
   - Experience relevance (30%)
   - Job title/role match (20%)
   - Keywords overlap (10%)

2. Identify:
   - Matching skills (list them)
   - Relevant experience (brief)
   - Missing requirements (if any)

Return a JSON response in this exact format:
{{
  "score": <number 0-100>,
  "matchingSkills": ["skill1", "skill2", ...],
  "relevantExperience": "brief description",
  "missingRequirements": ["req1", "req2", ...],
  "reasoning": "brief explanation of the score"
}}

Only return the JSON, nothing else.
`);

const outputParser = new StringOutputParser();

export async function calculateJobMatch(resumeText, job) {
  if (!resumeText || resumeText.trim().length === 0) {
    return {
      score: 0,
      matchingSkills: [],
      relevantExperience: 'No resume uploaded',
      missingRequirements: job.skills || [],
      reasoning: 'Please upload your resume to see match scores'
    };
  }

  try {
    const chain = matchingPrompt.pipe(llm).pipe(outputParser);
    
    const result = await chain.invoke({
      resumeText: resumeText.substring(0, 3000),
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description.substring(0, 1000),
      skills: (job.skills || []).join(', ')
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        matchingSkills: parsed.matchingSkills || [],
        relevantExperience: parsed.relevantExperience || '',
        missingRequirements: parsed.missingRequirements || [],
        reasoning: parsed.reasoning || ''
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Job matching error:', error);
    return simpleMatch(resumeText, job);
  }
}

function simpleMatch(resumeText, job) {
  const resumeLower = resumeText.toLowerCase();
  const skills = job.skills || [];
  
  const matchingSkills = skills.filter(skill => 
    resumeLower.includes(skill.toLowerCase())
  );
  
  const missingSkills = skills.filter(skill => 
    !resumeLower.includes(skill.toLowerCase())
  );
  
  const titleWords = job.title.toLowerCase().split(' ');
  const titleMatch = titleWords.some(word => 
    word.length > 3 && resumeLower.includes(word)
  );
  
  let score = 0;
  score += (matchingSkills.length / Math.max(skills.length, 1)) * 40;
  score += titleMatch ? 20 : 0;
  score += Math.min(40, resumeText.length / 50);
  
  return {
    score: Math.round(score),
    matchingSkills,
    relevantExperience: titleMatch ? `Experience relevant to ${job.title}` : 'Limited relevant experience',
    missingRequirements: missingSkills,
    reasoning: `Based on ${matchingSkills.length} matching skills out of ${skills.length} required`
  };
}

export async function batchMatchJobs(resumeText, jobs) {
  const results = await Promise.all(
    jobs.map(job => calculateJobMatch(resumeText, job))
  );
  
  return jobs.map((job, index) => ({
    ...job,
    matchScore: results[index].score,
    matchDetails: results[index]
  }));
}