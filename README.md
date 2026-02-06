#  AI-Powered Job Tracker with Smart Matching

A full-stack web application that helps job seekers track applications, get AI-powered job matches, and manage their job search efficiently with an intelligent assistant.

##  System Architecture

```

                         FRONTEND (React)                        
                      http://localhost:3000                      

                                                                 
               
    Login.jsx        Jobs.jsx     Applications           
                                      .jsx               
               
                                                              
                         
                                                                
                                             
                     AuthContext                              
                     (State Mgmt)                             
                                             
                                                                
                                             
                      api.js                                  
                    (Axios Client)                            
                                             

                              HTTP/REST
                             

                      BACKEND (Fastify)                          
                    http://localhost:3001/api                    

                                                                 
    ROUTES            
                                                               
    /auth      /jobs      /resume      /ai                    
    /applications                                              
            
                                                                
    SERVICES            
                                                               
                      
     Matching              AI Assistant                  
     Service               Service                       
                                                         
      Simple Match                       
      Score Calc           LangGraph                 
      Batch Job             Workflow                 
       Match                              
                                      
                                             
                               Gemini                   
                                 AI                     
                                             
                                         
            
                                                                 
    DATA STORAGE                
                                                               
     Users (Map)                                              
     Jobs (Array with match scores)                          
     Applications (Map)                                       
     Resumes (Map with parsed text)                          
     Conversation History (Map)                              
                                                               
                

                             
                             

                      EXTERNAL SERVICES                          

                                                                 
                        
    Google Gemini                Job Boards                 
    AI API                       (External)                 
    (Free Tier)                  applyLink                  
                        
                                                                 



                      DATA FLOW DIAGRAM                          

                                                                 
  User Upload Resume (PDF/TXT)                                   
                                                                
                                                                
  Resume Parser (pdf-parse)  Extract Text  Store in Map   
                                                                
                                                                
  User Browse Jobs  Match Algorithm             
                                                               
                                                               
                             Calculate Score                    
                             (0-100%)                           
                                                               
                                                               
  Display Jobs with Match Scores (Green/Yellow Badges)           
                                                                
                                                                
  Apply to Job  Open External Link  Return                
                                                                
                                                                
              "Did you apply?" Popup                             
                                                                
                                                                
              Save Application Status                            
                                                                 
  AI Chat: "Show remote jobs"                                    
                                                                
                                                                
  LangGraph Workflow:                                            
    1. Detect Intent (FILTER_UPDATE)                             
    2. Extract Filters ({workMode: "Remote"})                    
    3. Generate Response                                         
                                                                
                                                                
  Update Frontend Filters + Display Jobs                         
                                                                 

```

### Component Interactions

1. **User Authentication**:
   - User  Login Page  POST /api/auth/login  AuthContext  Jobs Page

2. **Resume Upload**:
   - User  Upload Button  File (PDF/TXT)  POST /api/resume/upload
   - Backend  pdf-parse  Extract Text  Store in userResumes Map

3. **Job Matching**:
   - Jobs  matchingService.simpleMatch(resume, job)
   - Calculate: Skills (40%) + Title (20%) + Experience (40%)
   - Return: score, matchingSkills, missingRequirements

4. **AI Assistant**:
   - User Message  POST /api/ai/chat
   - LangGraph: detectIntent  extractFilters  generateResponse
   - Return: { filters, response }  Update Frontend Filters

5. **Application Tracking**:
   - Apply Click  External Job Link Opens  User Returns
   - Popup: "Did you apply?"  POST /api/applications
   - Track: Applied  Interview  Offer/Rejected


##  Features

### Core Functionality
- ** Authentication** - Secure login system
- ** Resume Management** - Upload PDF/TXT resumes with parsing
- ** AI Job Matching** - Smart matching algorithm (0-100% score) based on your resume
- ** Best Matches** - Dedicated section showing top 6-8 jobs (>70% match)
- ** Advanced Filters** - Filter by role, skills, date, job type, work mode, location, match score
- ** Application Tracking** - Full lifecycle: Applied  Interview  Offer/Rejected
- ** AI Assistant** - Natural language job search with LangGraph orchestration
- ** Smart Apply** - External job links with "Did you apply?" confirmation flow

### AI-Powered Features
- **LangGraph Workflow** - Intent detection, filter extraction, response generation
- **Google Gemini Integration** - Free AI-powered conversational assistant
- **Smart Filter Control** - AI directly updates frontend filters via natural language
- **Context Awareness** - Maintains conversation history

##  Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x (fastest Node.js framework)
- **AI/ML**: LangChain + LangGraph + Google Gemini
- **File Processing**: pdf-parse (resume extraction)
- **Data**: In-memory storage (Map-based)

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

##  Installation

### Prerequisites
- Node.js 18+ and npm
- Git
- Google Gemini API key (free) - Get from: https://makersuite.google.com/app/apikey

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd job
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

##  Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### Access the App
1. Open http://localhost:3000 in your browser
2. Login with:
   - Email: `test@gmail.com`
   - Password: `test@123`

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation |
| GET | `/health` | Health check |
| POST | `/api/auth/login` | User authentication |
| GET | `/api/jobs` | Get all jobs (with filters) |
| POST | `/api/resume/upload` | Upload resume (PDF/TXT) |
| GET | `/api/resume/status` | Check resume status |
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | Get all applications |
| POST | `/api/ai/chat` | Chat with AI assistant |

##  Usage

### 1. Upload Your Resume
- Click on profile icon  Upload Resume
- Supports PDF and TXT formats (max 5MB)
- Resume is parsed and used for job matching

### 2. Browse Jobs
- View 10 curated job listings
- **Best Matches** section shows top jobs (>70% match)
- Color-coded match badges:  Green (>70%),  Yellow (40-70%)

### 3. Filter Jobs
**Manual Filters:**
- Role/Title
- Skills (React, Node.js, Python, etc.)
- Date Posted (24h, Week, Month)
- Job Type (Full-time, Part-time, Contract, Internship)
- Work Mode (Remote, Hybrid, On-site)
- Location
- Match Score (High, Medium)

**AI Assistant:**
- "Show me remote React jobs"
- "Find full-time positions posted this week"
- "High match scores only"
- "Clear all filters"

### 4. Apply to Jobs
- Click "Apply" on any job card
- Opens external application page in new tab
- On return: popup asks "Did you apply?"
- Choose status: Applied / In Progress / Not Applied / Applied Earlier
- Add notes (optional)

### 5. Track Applications
- View all applications in Applications tab
- Update status: Applied  Interview  Offer/Rejected
- See timeline and statistics

##  AI Assistant Commands

| Command | Action |
|---------|--------|
| "Show me remote jobs" | Sets work mode filter to Remote |
| "Find React and Node.js jobs" | Filters by skills |
| "Full-time only" | Sets job type filter |
| "Last 24 hours" | Sets date filter |
| "High match scores" | Shows only >70% matches |
| "Clear filters" | Resets all filters |
| "How do I upload my resume?" | Help response |
| "Where are my applications?" | Navigation help |

##  Project Structure

```
job/
 backend/
    src/
       routes/
          auth.js          # Authentication
          jobs.js          # Job listings
          resume.js        # Resume upload/parsing
          applications.js  # Application CRUD
          ai.js            # AI chat endpoint
       services/
          assistantService.js  # LangGraph AI
          matchingService.js   # Job matching
       index.js             # Main server
    .env                     # Environment variables (not in git)
    .env.example             # Example env file
    package.json

 frontend/
    src/
       components/
          Header.jsx
          JobCard.jsx
          Filters.jsx
          AIAssistant.jsx
          ApplyPopup.jsx
          ResumeUpload.jsx
       pages/
          Login.jsx
          Jobs.jsx
          Applications.jsx
       context/
          AuthContext.jsx
       services/
          api.js           # Axios HTTP client
       App.jsx
    package.json

 .gitignore
 README.md
```

##  Security Notes

 **IMPORTANT**: Never commit the `.env` file to git!
- `.env` is in `.gitignore` to prevent accidental commits
- Use `.env.example` to document required variables
- Store API keys securely

##  Troubleshooting

### Backend won't start
```bash
# Kill any process on port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Restart
cd backend
npm run dev
```

### Frontend won't start
```bash
# Kill any process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Restart
cd frontend
npm run dev
```

### AI not working
1. Check `.env` has valid `GOOGLE_API_KEY`
2. App falls back to rule-based matching if API fails
3. Check backend logs for errors

##  Assignment Requirements Checklist

 **Module 1**: Authentication - Login system  
 **Module 2**: Resume Management - PDF/TXT upload & parsing  
 **Module 3**: Job Feed - 10 mock jobs with filtering  
 **Module 4**: Manual Filters - All 7 filter types  
 **Module 5**: AI Job Matching - Keyword-based algorithm  
 **Module 6**: Best Matches - Top 6-8 jobs (>70%) displayed separately  
 **Module 7**: Smart Apply - External links + "Did you apply?" confirmation  
 **Module 8**: AI Assistant - LangGraph + Gemini + UI filter control  
 **Module 9**: Application Tracking - Full CRUD with timeline  
 **Module 10**: Frontend UI - React + TailwindCSS + responsive  
 **Module 11**: Backend API - 12 Fastify endpoints  
 **Module 12**: Deployment - Ready for production (Vercel/Railway)  

##  Deployment

### Backend (Railway/Render)
1. Push to GitHub
2. Connect repository to Railway/Render
3. Add environment variables in dashboard
4. Deploy automatically

### Frontend (Vercel)
1. Push to GitHub
2. Import project to Vercel
3. Set `VITE_API_URL` to backend URL
4. Deploy automatically

##  License

MIT

##  Author

Built as part of AI-powered job tracking assignment demonstrating:
- LangChain & LangGraph integration
- Full-stack development
- AI/ML features
- Modern React patterns
- RESTful API design

---

**Made with  using React, Fastify, LangChain, and Google Gemini**