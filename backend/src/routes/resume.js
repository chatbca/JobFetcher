import pdf from 'pdf-parse';
import { updateUserResume, findUserByEmail } from '../models/data.js';
import { promisify } from 'util';
import { pipeline } from 'stream';
const pump = promisify(pipeline);

export default async function resumeRoutes(fastify, options) {
  // Upload resume
  fastify.post('/upload', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }
    
    try {
      // Read file buffer
      const buffer = await data.toBuffer();
      let resumeText = '';
      
      // Extract text based on file type
      if (data.mimetype === 'application/pdf') {
        const pdfData = await pdf(buffer);
        resumeText = pdfData.text;
      } else if (data.mimetype === 'text/plain') {
        resumeText = buffer.toString('utf-8');
      } else {
        return reply.code(400).send({ error: 'Unsupported file type. Please upload PDF or TXT.' });
      }
      
      // Update user's resume
      const user = findUserByEmail('test@gmail.com');
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      updateUserResume(user.id, {
        filename: data.filename,
        mimetype: data.mimetype,
        uploadedAt: new Date()
      }, resumeText);
      
      return {
        success: true,
        message: 'Resume uploaded successfully',
        filename: data.filename,
        textLength: resumeText.length
      };
    } catch (error) {
      console.error('Resume upload error:', error);
      return reply.code(500).send({ error: 'Failed to process resume' });
    }
  });
  
  // Get resume status
  fastify.get('/status', async (request, reply) => {
    const user = findUserByEmail('test@gmail.com');
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return {
      hasResume: !!user.resume,
      resume: user.resume,
      textLength: user.resumeText?.length || 0
    };
  });
  
  // Delete resume
  fastify.delete('/', async (request, reply) => {
    const user = findUserByEmail('test@gmail.com');
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    updateUserResume(user.id, null, '');
    
    return {
      success: true,
      message: 'Resume deleted successfully'
    };
  });
}
