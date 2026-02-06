#  QUICK START GUIDE

## Get Running in 5 Minutes!

### Step 1: Install Backend Dependencies
\\\ash
cd backend
npm install
\\\

### Step 2: Setup Environment Variables
\\\ash
# Create .env file in backend/
echo PORT=3001 > .env
echo OPENAI_API_KEY=your_actual_openai_key_here >> .env
\\\

** IMPORTANT**: Replace \your_actual_openai_key_here\ with your real OpenAI API key!
Get one at: https://platform.openai.com/api-keys

### Step 3: Start Backend
\\\ash
# From backend/ directory
npm start
\\\

You should see: "Server running on http://localhost:3001"

### Step 4: Install Frontend Dependencies (New Terminal)
\\\ash
cd frontend
npm install
\\\

### Step 5: Start Frontend
\\\ash
# From frontend/ directory
npm run dev
\\\

You should see: "Local: http://localhost:3000"

### Step 6: Open Browser
1. Navigate to **http://localhost:3000**
2. Login with:
   - Email: test@gmail.com
   - Password: test@123

### Step 7: Upload Resume
1. Upload a test resume (PDF or TXT)
2. Wait for job matching to complete
3. See match scores on all jobs!

### Step 8: Try the AI Assistant
1. Click the chat bubble (bottom-right)
2. Try commands like:
   - "Show me remote jobs"
   - "Filter by last 24 hours"
   - "Find React developer roles"
   - "High match scores only"

##  You're Ready!

The app should be fully functional now. Check out the main README.md for:
- Architecture details
- LangChain/LangGraph explanations
- API documentation
- Deployment instructions

##  Troubleshooting

**Backend won't start:**
- Check if port 3001 is available
- Verify OPENAI_API_KEY is set in .env
- Run: \
pm install\ again

**Frontend won't start:**
- Check if port 3000 is available
- Run: \
pm install\ again  
- Clear browser cache

**Jobs won't load:**
- Backend must be running first
- Check browser console for errors
- Verify API proxy in vite.config.js

**Match scores showing 0:**
- Upload a resume first!
- Check OPENAI_API_KEY is valid
- Look for errors in backend terminal

##  Next Steps

1.  Test all filters (Role, Skills, Date, Job Type, Work Mode, Location, Match Score)
2.  Apply to a job and test the smart popup
3.  Track applications in the Applications tab
4.  Chat with the AI assistant
5.  Build for production: \
pm run build\

Happy coding! 
