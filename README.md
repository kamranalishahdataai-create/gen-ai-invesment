# 💹 GenAI Investment Learning Platform

> **Phase 1** - AI-powered educational platform for investment learning

An intelligent platform that explains investment concepts to beginners through AI-generated educational content. Ask any finance question and get simple, jargon-free explanations.

---

## 🎯 Phase 1 Overview

### ✅ What's Included

| Feature | Status | Description |
|---------|--------|-------------|
| **AI Question Processing** | ✅ Complete | User asks questions, AI processes and responds |
| **Intent Detection** | ✅ Complete | Detects educational vs. advisory queries |
| **Script Generation** | ✅ Complete | Creates beginner-friendly educational scripts |
| **Key Takeaways** | ✅ Complete | Extracts main learning points |
| **Related Questions** | ✅ Complete | Suggests follow-up topics |
| **Market Data (Mock)** | ✅ Complete | Displays placeholder market information |
| **Comparison Tables** | ✅ Complete | Shows instrument comparisons |
| **Modern UI** | ✅ Complete | Clean, responsive design |
| **Educational Disclaimer** | ✅ Complete | Always displayed for compliance |

### ❌ Intentionally Excluded (Phase 2+)

| Feature | Reason | Planned Phase |
|---------|--------|---------------|
| Video Generation | Requires D-ID/Synthesia integration | Phase 2 |
| Real Market APIs | Requires API subscriptions | Phase 2 |
| User Authentication | Not needed for demo | Phase 3 |
| Payment Processing | Future monetization | Phase 4 |
| Mobile Apps | Web-first approach | Phase 3+ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────┬──────────────┬─────────────┬───────────────┐  │
│  │ QuestionBox │ VideoHolder  │  Takeaways  │ RelatedQuests │  │
│  └─────────────┴──────────────┴─────────────┴───────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MarketPanel                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    /ask Endpoint                         │   │
│  │  • Receives question                                     │   │
│  │  • Returns: intent, script, takeaways, related, market   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│         ┌────────────────────┴────────────────────┐            │
│         ▼                                         ▼            │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │   LLM Service   │                   │ Market Service  │     │
│  │ (Mock - Phase 1)│                   │ (Mock - Phase 1)│     │
│  │                 │                   │                 │     │
│  │ PHASE 2:        │                   │ PHASE 2:        │     │
│  │ OpenAI/Anthropic│                   │ Yahoo Finance   │     │
│  │ Integration     │                   │ Alpha Vantage   │     │
│  └─────────────────┘                   └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn**

### 1. Clone & Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📱 Demo Flow

```
User Journey:
─────────────
    ┌─────────────────────────────────────┐
    │  User types: "What is SIP?"         │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  Backend processes question         │
    │  • Detects intent: Educational      │
    │  • Extracts topic: SIP              │
    │  • Generates 60-90s script          │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  Frontend displays:                  │
    │  • Video placeholder with script    │
    │  • 5 key takeaways                  │
    │  • 5 related questions              │
    │  • Market snapshot (if applicable)  │
    │  • Comparison table                 │
    │  • Educational disclaimer           │
    └─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
genai-investment-platform-phase1/
│
├── backend/
│   ├── main.py                 # FastAPI application & endpoints
│   ├── requirements.txt        # Python dependencies
│   └── services/
│       ├── llm.py              # AI/LLM service (mock implementation)
│       └── market_data.py      # Market data service (mock implementation)
│
├── frontend/
│   ├── index.html              # HTML entry point
│   ├── package.json            # NPM dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Main application component
│       ├── index.css           # Global styles
│       └── components/
│           ├── QuestionBox.jsx      # Question input form
│           ├── VideoPlaceholder.jsx # Video display (placeholder)
│           ├── Takeaways.jsx        # Key takeaways display
│           ├── RelatedQuestions.jsx # Related questions list
│           └── MarketPanel.jsx      # Market data display
│
└── README.md                   # This file
```

---

## 🔌 API Reference

### `POST /ask`

Process a user question and return educational content.

**Request:**
```json
{
  "question": "What is SIP?"
}
```

**Response:**
```json
{
  "intent": "educational",
  "topic": "SIP (Systematic Investment Plan)",
  "script": "Let's talk about SIP...",
  "key_takeaways": [
    "💰 SIP lets you invest small amounts regularly...",
    "📊 Rupee cost averaging reduces impact..."
  ],
  "related_questions": [
    "What is the difference between SIP and lump sum investing?",
    "How do I choose the right mutual fund for SIP?"
  ],
  "disclaimer": "⚠️ Disclaimer: This content is for educational purposes only...",
  "market_data": { ... },
  "comparison": { ... }
}
```

### `GET /market-data?instrument=gold`

Get market data for a specific instrument.

### `GET /compare?left=gold&right=fd`

Compare two financial instruments.

---

## 🎨 Supported Topics (Phase 1)

The following topics have detailed mock content:

| Topic | Keywords |
|-------|----------|
| SIP | sip, systematic investment plan |
| Mutual Funds | mutual fund, mutual funds, mf |
| Gold | gold |
| Fixed Deposits | fd, fixed deposit |
| PPF | ppf, public provident fund |
| Nifty 50 | nifty, nifty 50, sensex |

*Other topics will receive generic educational responses.*

---

## 🔮 Phase 2 Roadmap

### Planned Integrations

| Service | Purpose | Provider Options |
|---------|---------|------------------|
| **LLM** | Script generation | OpenAI GPT-4, Anthropic Claude |
| **Video** | AI avatar videos | D-ID, Synthesia, HeyGen |
| **Market Data** | Real-time prices | Yahoo Finance, Alpha Vantage |
| **Voice** | Narration | ElevenLabs, Amazon Polly |

### Phase 2 Features
- [ ] Real AI-generated scripts using GPT-4
- [ ] Animated avatar video generation
- [ ] Live market data integration
- [ ] User accounts & saved history
- [ ] Regional language support
- [ ] Mobile-responsive PWA

---

## 🧪 Testing the Demo

### Sample Questions to Try

1. **Educational Query**: "What is SIP?"
2. **Educational Query**: "How do mutual funds work?"
3. **Advisory Query** (redirected): "Should I invest in gold?"
4. **Comparison Query**: "What is the difference between FD and PPF?"

### Expected Behavior

- ✅ Clean UI loads without errors
- ✅ Question submission shows loading state
- ✅ Response displays all sections properly
- ✅ Related questions are clickable
- ✅ Market data appears for financial instruments
- ✅ Disclaimer is always visible

---

## 🛠️ Development Notes

### For Non-Technical Clients

**What this demo proves:**
1. The AI can understand investment questions
2. Content is beginner-friendly and neutral
3. UI is clean and intuitive
4. Architecture supports future enhancements

**What needs Phase 2:**
1. Real AI (currently using smart templates)
2. Real videos (currently placeholder)
3. Live market prices (currently demo data)

### For Developers

**Code Quality:**
- ✅ Modular service architecture
- ✅ Clear separation of concerns
- ✅ Comprehensive code comments
- ✅ Error handling implemented
- ✅ CORS configured for local dev
- ✅ Response models documented

**Integration Points (marked in code):**
- `llm.py` - Look for `PHASE 2:` comments
- `market_data.py` - Look for `PHASE 2:` comments
- `VideoPlaceholder.jsx` - Ready for video player

---

## 📝 License

This project is proprietary and confidential.

---

## 📞 Support

For questions about this demo, please contact the development team.

---

*Built with ❤️ for financial education*
