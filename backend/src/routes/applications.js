import { addApplication, updateApplicationStatus, getUserApplications } from '../models/data.js';

export default async function applicationRoutes(fastify, options) {
  // Get all applications for user
  fastify.get('/', async (request, reply) => {
    const userId = '1'; // Hardcoded for simplicity
    const applications = getUserApplications(userId);
    
    return {
      applications,
      total: applications.length
    };
  });
  
  // Create new application
  fastify.post('/', async (request, reply) => {
    const { jobId, jobTitle, company, status, appliedVia } = request.body;
    
    const application = addApplication({
      userId: '1',
      jobId,
      jobTitle,
      company,
      status: status || 'Applied',
      appliedVia: appliedVia || 'external',
      timeline: [{
        status: status || 'Applied',
        timestamp: new Date()
      }]
    });
    
    return application;
  });
  
  // Update application status
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ 
        error: 'Invalid status',
        validStatuses 
      });
    }
    
    const application = updateApplicationStatus(id, status);
    
    if (!application) {
      return reply.code(404).send({ error: 'Application not found' });
    }
    
    return application;
  });
  
  // Delete application
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const userId = '1';
    
    const applications = getUserApplications(userId);
    const index = applications.findIndex(a => a.id === id);
    
    if (index === -1) {
      return reply.code(404).send({ error: 'Application not found' });
    }
    
    applications.splice(index, 1);
    
    return { success: true, message: 'Application deleted' };
  });
  
  // Get application stats
  fastify.get('/stats', async (request, reply) => {
    const userId = '1';
    const applications = getUserApplications(userId);
    
    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'Applied').length,
      interview: applications.filter(a => a.status === 'Interview').length,
      offer: applications.filter(a => a.status === 'Offer').length,
      rejected: applications.filter(a => a.status === 'Rejected').length
    };
    
    return stats;
  });
}
