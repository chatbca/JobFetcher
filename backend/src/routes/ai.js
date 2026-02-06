import { chatWithAssistant } from '../services/assistantService.js';

// Store conversation history in memory (should be per-user in production)
const conversations = new Map();

export default async function aiRoutes(fastify, options) {
  // Chat with AI assistant
  fastify.post('/chat', async (request, reply) => {
    const { message, sessionId } = request.body;
    
    if (!message) {
      return reply.code(400).send({ error: 'Message is required' });
    }
    
    // Get or create conversation history
    const conversationId = sessionId || 'default';
    let history = conversations.get(conversationId) || [];
    
    try {
      // Get AI response
      const result = await chatWithAssistant(message, history);
      
      // Update history
      history.push(
        { role: 'user', content: message },
        { role: 'assistant', content: result.response }
      );
      
      // Keep only last 10 messages
      if (history.length > 20) {
        history = history.slice(-20);
      }
      
      conversations.set(conversationId, history);
      
      return {
        response: result.response,
        intent: result.intent,
        filters: result.filters,
        action: result.action,
        sessionId: conversationId
      };
    } catch (error) {
      console.error('Chat error:', error);
      return reply.code(500).send({ 
        error: 'Failed to process message',
        response: "I'm having trouble right now. Please try again."
      });
    }
  });
  
  // Clear conversation history
  fastify.delete('/chat/:sessionId', async (request, reply) => {
    const { sessionId } = request.params;
    conversations.delete(sessionId);
    
    return { success: true, message: 'Conversation cleared' };
  });
  
  // Get conversation history
  fastify.get('/chat/:sessionId', async (request, reply) => {
    const { sessionId } = request.params;
    const history = conversations.get(sessionId) || [];
    
    return { history };
  });
}
