# Quick Start Guide

## Running the Application

### Step 1: Set Up Environment Variables
Create a \.env\ file in the \ackend/\ directory:

\\\env
OPENAI_API_KEY=your_openai_api_key_here
ADZUNA_APP_ID=your_optional_adzuna_id
ADZUNA_API_KEY=your_optional_adzuna_key
PORT=3001
\\\

**Important**: You need an OpenAI API key. Get one at https://platform.openai.com/api-keys

### Step 2: Start Backend Server

Open a terminal and run:
\\\ash
cd backend
npm start
\\\

Backend will run at http://localhost:3001

### Step 3: Start Frontend Development Server

Open a **new terminal** and run:
\\\ash
cd frontend
npm run dev
\\\

Frontend will run at http://localhost:3000

### Step 4: Login

Navigate to http://localhost:3000

Use demo credentials:
- Email: test@gmail.com
- Password: test@123

Or click "Use Demo Credentials" button

## Testing the AI Features

### 1. Upload Resume
- Click "Upload Resume" button in header
- Upload a PDF or TXT resume
- Wait for processing

### 2. AI Assistant
- Click the blue chat bubble in bottom-right
- Try commands like:
  - "Show me remote React jobs"
  - "Find Python roles posted this week"
  - "Remote full-time positions"
  - "Show me high match jobs"

### 3. Apply to Jobs
- Click "Apply" on any job card
- Follow the 3-step flow
- Track in Applications page

## Troubleshooting

### Backend won't start
- Ensure OpenAI API key is set in .env
- Check if port 3001 is available
- Run 
pm install in backend/

### Frontend won't start
- Run 
pm install in frontend/
- Check if port 3000 is available
- Clear browser cache

### AI features not working
- Verify OpenAI API key is valid
- Check backend console for errors
- Ensure you have API credits

## What's Working

 Backend API (12 endpoints)
 LangChain job matching
 LangGraph AI assistant
 Resume upload & parsing
 React frontend with Vite
 TailwindCSS styling
 All components and pages
 React Router navigation
 Authentication flow
 Mock job data (10 jobs)

## Next Steps

1. Upload your resume to test AI matching
2. Use AI assistant to filter jobs
3. Apply to jobs and track applications
4. Try different filter combinations
5. Check the Applications dashboard

## Demo Flow

1. Login with test@gmail.com/test@123
2. Upload resume (use a real PDF/TXT resume)
3. See match scores on job cards
4. Click AI chat bubble
5. Ask: "Show me remote jobs"
6. See filters update automatically
7. Click "Apply" on a high-match job
8. Add notes and save
9. Go to Applications page
10. See your tracked applications

Enjoy your AI-powered job search! 
