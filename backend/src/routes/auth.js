import { findUserByEmail } from '../models/data.js';

export default async function authRoutes(fastify, options) {
  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    
    const user = findUserByEmail(email);
    
    if (!user || user.password !== password) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Return user data (without password)
    const { password: _, ...userData } = user;
    return {
      success: true,
      user: userData,
      token: 'dummy-token-' + user.id // In production, use proper JWT
    };
  });
  
  // Get current user
  fastify.get('/me', async (request, reply) => {
    // In production, verify JWT token
    const userId = '1'; // Hardcoded for simplicity
    const user = findUserByEmail('test@gmail.com');
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const { password, ...userData } = user;
    return userData;
  });
}
