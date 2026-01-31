# GenAI Investment Learning Platform - Deployment Guide

## Project Structure

```
genai-investment-platform/
├── backend/                    # FastAPI Python Backend
│   ├── main.py                 # Main API application
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (API keys)
│   └── services/
│       ├── llm.py              # OpenAI GPT integration + content filtering
│       ├── market_data.py      # Gold API + market data
│       ├── audio.py            # ElevenLabs text-to-speech
│       ├── video.py            # AIML/Kling video generation
│       └── vadoo.py            # Vadoo AI video generation
│
├── frontend/                   # React + Vite Frontend
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── index.html              # Entry HTML
│   └── src/
│       ├── App.jsx             # Main React component
│       ├── main.jsx            # React entry point
│       ├── index.css           # Global styles
│       └── components/
│           ├── QuestionBox.jsx      # Question input
│           ├── VideoPlaceholder.jsx # Video/audio player
│           ├── Takeaways.jsx        # Key takeaways
│           ├── RelatedQuestions.jsx # Related questions
│           ├── MarketPanel.jsx      # Market data display
│           ├── Macroeconomy.jsx     # Macro indicators
│           ├── Navigation.jsx       # Navigation bar
│           ├── TopicContent.jsx     # Topic explanation
│           └── InvestorGuide.jsx    # Investor guide
│
├── README.md                   # Project overview
└── DEPLOYMENT.md               # This file
```

---

## API Keys Required

Create a `.env` file in the `backend/` folder with these keys:

```env
# OpenAI API Key (Required - for AI content generation)
OPENAI_API_KEY=sk-proj-xxxxx

# Gold API Key (Required - for real gold prices)
# Get from: https://www.goldapi.io/
GOLD_API_KEY=goldapi-xxxxx

# ElevenLabs API Key (Required - for audio narration)
# Get from: https://elevenlabs.io/
ELEVENLABS_API_KEY=sk_xxxxx

# AIML API Key (Optional - for Kling AI video generation)
# Get from: https://aimlapi.com/
AIML_API_KEY=xxxxx

# Vadoo AI API Key (Optional - for full video generation)
# Get from: https://ai.vadoo.tv/
VADOO_API_KEY=xxxxx

# Server Configuration
HOST=127.0.0.1
PORT=8000
```

---

## Local Development Setup

### Backend (FastAPI)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend will be available at: `http://127.0.0.1:8000`

### Frontend (React + Vite)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Production Deployment

### Option 1: Docker (Recommended)

Create `Dockerfile` for backend:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `Dockerfile` for frontend:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 2: Cloud Platforms

**Backend (FastAPI):**
- **Render.com** - Free tier available
- **Railway.app** - Easy deployment
- **Heroku** - Classic choice
- **AWS Lambda** with Mangum adapter
- **Google Cloud Run**

**Frontend (React):**
- **Vercel** - Best for React/Vite (free)
- **Netlify** - Easy static hosting (free)
- **Cloudflare Pages** - Fast CDN (free)

### Option 3: VPS Deployment

```bash
# On Ubuntu/Debian server

# Install dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs npm nginx

# Clone repository
git clone <your-repo-url>
cd genai-investment-platform

# Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service for backend
sudo nano /etc/systemd/system/genai-backend.service
```

Backend service file:
```ini
[Unit]
Description=GenAI Investment Platform Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
EnvironmentFile=/path/to/backend/.env
ExecStart=/path/to/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## API Endpoints Summary

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/ask` | Process investment question |
| GET | `/market-data?asset=gold` | Get market data |
| GET | `/macro/{country}` | Get macroeconomic data |

### Audio/Video Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-audio` | Generate audio narration |
| GET | `/voices` | List available voices |
| POST | `/generate-video` | Generate video (AIML) |
| GET | `/video-status/{id}` | Check video status |
| POST | `/vadoo/generate-video` | Generate video (Vadoo AI) |
| GET | `/vadoo/topics` | List Vadoo topics |
| GET | `/vadoo/voices` | List Vadoo voices |

---

## Content Restrictions

The platform is restricted to **investment, finance, and macroeconomy** topics only:

**Allowed Topics:**
- Investment instruments (SIP, mutual funds, stocks, gold, etc.)
- Financial concepts (compound interest, diversification, etc.)
- Macroeconomic indicators (inflation, GDP, interest rates, etc.)
- Indian market context (NIFTY, SENSEX, RBI, SEBI, etc.)

**Blocked Topics:**
- Cooking/recipes
- Movies/entertainment
- Sports
- Health/medicine
- Relationships
- Politics
- General knowledge

---

## Security Features

1. **Non-Advisory Safety Layer** - Never gives investment recommendations
2. **Content Filtering** - Only finance/investment topics allowed
3. **Disclaimer Injection** - Educational disclaimer always included
4. **API Key Security** - Keys stored in environment variables
5. **CORS Configuration** - Restricted to allowed origins

---

## Testing

```bash
# Test backend health
curl http://127.0.0.1:8000/

# Test ask endpoint
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is SIP?"}'

# Test off-topic rejection
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How to make pasta?"}'
# Should return 400 error

# Test market data
curl http://127.0.0.1:8000/market-data?asset=gold
```

---

## Support

For any deployment issues or questions, please contact the development team.
