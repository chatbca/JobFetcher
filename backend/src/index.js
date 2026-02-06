import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import resumeRoutes from './routes/resume.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register plugins
await fastify.register(cors, {
  origin: true
});

await fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Root route - API info
fastify.get('/', async (request, reply) => {
  return {
    name: 'AI-Powered Job Tracker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      jobs: '/api/jobs',
      resume: '/api/resume/*',
      applications: '/api/applications',
      ai: '/api/ai/chat'
    },
    frontend: 'http://localhost:3000',
    documentation: 'Visit the frontend at http://localhost:3000'
  };
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(jobRoutes, { prefix: '/api/jobs' });
fastify.register(resumeRoutes, { prefix: '/api/resume' });
fastify.register(applicationRoutes, { prefix: '/api/applications' });
fastify.register(aiRoutes, { prefix: '/api/ai' });

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`

   AI Job Tracker API Server                     
   Backend:  http://localhost:${port}              
   Frontend: http://localhost:3000               
   API Docs: http://localhost:${port}/           

    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();