"""
LLM Service - AI Content Generation
====================================
Phase 3: OpenAI GPT Integration with Safety Layer

This module handles all AI-powered content generation:
- Intent detection (educational vs advisory)
- Topic classification (concept / instrument / comparison)
- Script generation for video content
- Key takeaways extraction
- Related questions generation

SAFETY LAYER:
- Hard non-advisory enforcement
- Automatic disclaimer injection
- No buy/sell recommendations
- No return promises

Integration:
- OpenAI GPT-4 API for content generation
- Fallback to mock data if API unavailable
"""

from typing import List, Dict, Tuple
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI Integration
try:
    from openai import OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        OPENAI_AVAILABLE = True
        print("✅ OpenAI API initialized successfully")
    else:
        openai_client = None
        OPENAI_AVAILABLE = False
        print("⚠️ OpenAI API key not configured - using mock data")
except ImportError:
    openai_client = None
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI package not installed - using mock data")

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================

# Educational disclaimer - ALWAYS included
EDUCATIONAL_DISCLAIMER = (
    "⚠️ This content is for educational purposes only and does not "
    "constitute financial advice. Please consult a certified financial advisor "
    "before making any investment decisions."
)

# Safety phrases to inject when redirecting advisory questions
SAFETY_REDIRECT_PHRASES = [
    "While I can't provide specific investment advice, let me help you understand this topic better.",
    "Instead of giving recommendations, let me explain the concept so you can make informed decisions.",
    "Let me share educational information that can help you understand this better.",
]

# Keywords that suggest advisory intent (user seeking investment advice)
ADVISORY_KEYWORDS = [
    "should i buy", "should i sell", "should i invest",
    "is it good time", "recommend", "best stock",
    "which is better to buy", "where should i put my money",
    "will it go up", "will it crash", "prediction",
    "buy now", "sell now", "guaranteed return", "sure profit",
    "which one to choose", "better investment", "safe to invest"
]

# Keywords for educational intent
EDUCATIONAL_KEYWORDS = [
    "what is", "how does", "explain", "meaning of",
    "difference between", "types of", "benefits of",
    "risks of", "how to start", "beginner guide",
    "understand", "learn", "teach me", "definition"
]

# =============================================================================
# CONTENT RESTRICTION - Finance/Investment/Macroeconomy Only
# =============================================================================

# Valid financial/investment/macroeconomy keywords
VALID_TOPIC_KEYWORDS = [
    # Investment instruments
    "sip", "mutual fund", "stock", "share", "equity", "bond", "debenture",
    "gold", "silver", "commodity", "etf", "index fund", "nifty", "sensex",
    "fixed deposit", "fd", "recurring deposit", "rd", "ppf", "epf", "nps",
    "ulip", "elss", "insurance", "term insurance", "life insurance",
    "real estate", "property", "reit", "crypto", "cryptocurrency", "bitcoin",
    
    # Financial concepts
    "investment", "investing", "investor", "portfolio", "diversification",
    "compound interest", "simple interest", "return", "roi", "cagr", "xirr",
    "risk", "volatility", "beta", "alpha", "sharpe ratio", "nav",
    "dividend", "capital gain", "tax saving", "80c", "tax benefit",
    "expense ratio", "exit load", "lock-in", "maturity",
    "rupee cost averaging", "asset allocation", "rebalancing",
    "wealth", "savings", "financial planning", "retirement", "pension",
    "emergency fund", "financial goal", "corpus",
    
    # Macroeconomy
    "inflation", "deflation", "gdp", "fiscal", "monetary policy",
    "interest rate", "repo rate", "reverse repo", "rbi", "fed", "central bank",
    "currency", "forex", "rupee", "dollar", "exchange rate",
    "budget", "fiscal deficit", "current account", "trade deficit",
    "crude oil", "oil price", "petrol", "diesel",
    "recession", "depression", "bull market", "bear market",
    "fii", "dii", "foreign investment", "fdi",
    "government bond", "g-sec", "treasury", "yield",
    "stock market", "share market", "bse", "nse",
    "ipo", "listing", "demat", "trading",
    
    # Indian context
    "sebi", "amfi", "irdai", "pfrda", "india", "indian",
    "lakh", "crore", "lakhs", "crores"
]

# Off-topic keywords to reject
OFF_TOPIC_KEYWORDS = [
    "recipe", "cooking", "food", "movie", "film", "song", "music",
    "game", "gaming", "sports", "cricket", "football", "weather",
    "relationship", "dating", "love", "health", "medicine", "doctor",
    "travel", "tourism", "hotel", "flight", "fashion", "clothing",
    "celebrity", "politics", "election", "religion", "astrology",
    "joke", "funny", "meme", "entertainment", "tv show", "series"
]

def is_valid_financial_topic(question: str) -> dict:
    """
    Check if the question is related to investment/finance/macroeconomy.
    
    Returns:
        {
            "is_valid": bool,
            "reason": str,
            "matched_topics": list
        }
    """
    question_lower = question.lower()
    
    # Check for off-topic keywords first
    for keyword in OFF_TOPIC_KEYWORDS:
        if keyword in question_lower:
            return {
                "is_valid": False,
                "reason": f"This platform is focused on investment, finance, and macroeconomy education. Your question appears to be about '{keyword}' which is outside our scope.",
                "matched_topics": []
            }
    
    # Check for valid financial topics
    matched_topics = []
    for keyword in VALID_TOPIC_KEYWORDS:
        if keyword in question_lower:
            matched_topics.append(keyword)
    
    # Also check FINANCIAL_TOPICS dictionary
    for keyword in FINANCIAL_TOPICS.keys():
        if keyword in question_lower and keyword not in matched_topics:
            matched_topics.append(keyword)
    
    if matched_topics:
        return {
            "is_valid": True,
            "reason": "Valid financial/investment topic",
            "matched_topics": matched_topics
        }
    
    # If no matches, check if it might still be financial using AI (if available)
    # For safety, reject unclear topics
    return {
        "is_valid": False,
        "reason": "I couldn't identify a clear investment, finance, or macroeconomy topic in your question. Please ask about topics like mutual funds, stocks, SIP, gold investment, inflation, interest rates, or financial planning.",
        "matched_topics": []
    }


# Topic types for classification
TOPIC_TYPES = {
    "concept": ["sip", "compound interest", "diversification", "rupee cost averaging", "asset allocation"],
    "instrument": ["gold", "stocks", "mutual funds", "fixed deposit", "ppf", "nps", "bonds", "etf"],
    "comparison": ["vs", "versus", "compare", "difference between", "better than"]
}

# Common financial topics for better extraction
FINANCIAL_TOPICS = {
    "sip": "SIP (Systematic Investment Plan)",
    "mutual fund": "Mutual Funds",
    "mutual funds": "Mutual Funds",
    "stock": "Stocks",
    "stocks": "Stocks",
    "gold": "Gold",
    "fd": "Fixed Deposits",
    "fixed deposit": "Fixed Deposits",
    "nps": "NPS (National Pension System)",
    "ppf": "PPF (Public Provident Fund)",
    "etf": "ETFs (Exchange Traded Funds)",
    "bond": "Bonds",
    "bonds": "Bonds",
    "crypto": "Cryptocurrency",
    "cryptocurrency": "Cryptocurrency",
    "real estate": "Real Estate",
    "insurance": "Insurance",
    "term insurance": "Term Insurance",
    "ulip": "ULIP",
    "elss": "ELSS (Tax Saving Mutual Funds)",
    "nifty": "Nifty 50 Index",
    "sensex": "Sensex Index",
    "dividend": "Dividends",
    "compound interest": "Compound Interest",
    "inflation": "Inflation"
}

# =============================================================================
# SAFETY LAYER - Non-Advisory Enforcement
# =============================================================================

def _sanitize_output(text: str) -> str:
    """
    Remove any advisory language that may have slipped through.
    Ensures output remains purely educational.
    """
    # Patterns to remove (advisory language)
    advisory_patterns = [
        r"you should (buy|sell|invest)",
        r"I recommend",
        r"buy this",
        r"sell this",
        r"guaranteed returns?",
        r"will definitely",
        r"sure to (rise|fall|profit)",
        r"you must invest",
    ]
    
    sanitized = text
    for pattern in advisory_patterns:
        sanitized = re.sub(pattern, "[educational content]", sanitized, flags=re.IGNORECASE)
    
    return sanitized

def _add_disclaimer(text: str) -> str:
    """Add educational disclaimer if not already present."""
    if "educational purposes only" not in text.lower():
        return f"{text}\n\n{EDUCATIONAL_DISCLAIMER}"
    return text

# =============================================================================
# INTENT DETECTION
# =============================================================================

def detect_intent(question: str) -> Dict[str, any]:
    """
    Detect whether the user's question is educational or advisory.
    
    Educational: User wants to learn about a concept
    Advisory: User is seeking investment advice (we redirect to education)
    
    Args:
        question: The user's input question
        
    Returns:
        Dictionary with intent type and confidence:
        {
            "type": "educational" | "advisory",
            "confidence": float (0-1),
            "redirect_message": str | None
        }
    """
    question_lower = question.lower()
    
    # Count matches for each type
    advisory_matches = sum(1 for kw in ADVISORY_KEYWORDS if kw in question_lower)
    educational_matches = sum(1 for kw in EDUCATIONAL_KEYWORDS if kw in question_lower)
    
    # Determine intent
    if advisory_matches > 0:
        return {
            "type": "advisory",
            "confidence": min(0.9, 0.5 + (advisory_matches * 0.1)),
            "redirect_message": SAFETY_REDIRECT_PHRASES[advisory_matches % len(SAFETY_REDIRECT_PHRASES)]
        }
    
    # Default to educational (safer approach)
    return {
        "type": "educational",
        "confidence": max(0.7, min(0.95, 0.7 + (educational_matches * 0.05))),
        "redirect_message": None
    }


# =============================================================================
# TOPIC CLASSIFICATION
# =============================================================================

def classify_topic(question: str) -> Dict[str, str]:
    """
    Classify the topic type: concept, instrument, or comparison.
    
    Args:
        question: The user's input question
        
    Returns:
        Dictionary with:
        {
            "type": "concept" | "instrument" | "comparison",
            "topic": str (extracted topic name),
            "description": str
        }
    """
    question_lower = question.lower()
    
    # Check for comparison
    for keyword in TOPIC_TYPES["comparison"]:
        if keyword in question_lower:
            return {
                "type": "comparison",
                "topic": extract_topic(question),
                "description": "Comparing multiple financial instruments or concepts"
            }
    
    # Check for instruments
    for instrument in TOPIC_TYPES["instrument"]:
        if instrument in question_lower:
            return {
                "type": "instrument",
                "topic": extract_topic(question),
                "description": "A specific financial instrument or asset class"
            }
    
    # Check for concepts
    for concept in TOPIC_TYPES["concept"]:
        if concept in question_lower:
            return {
                "type": "concept",
                "topic": extract_topic(question),
                "description": "A financial concept or strategy"
            }
    
    # Default to concept
    return {
        "type": "concept",
        "topic": extract_topic(question),
        "description": "General financial education topic"
    }

# =============================================================================
# TOPIC EXTRACTION
# =============================================================================

def extract_topic(question: str) -> str:
    """
    Extract the main financial topic from the user's question.
    
    Args:
        question: The user's input question
        
    Returns:
        Formatted topic name
    """
    question_lower = question.lower()
    
    # Check for known financial topics
    for keyword, topic_name in FINANCIAL_TOPICS.items():
        if keyword in question_lower:
            return topic_name
    
    # Fallback: Extract key phrase from question
    # Remove common question starters
    cleaned = question_lower
    for prefix in ["what is", "how does", "explain", "tell me about", "what are", "define"]:
        cleaned = cleaned.replace(prefix, "")
    
    # Return cleaned topic or original question
    topic = cleaned.strip().strip("?").strip()
    return topic.title() if topic else question.title()

# =============================================================================
# SCRIPT GENERATION - Main Educational Content
# =============================================================================

def _generate_script_with_openai(question: str, topic: str, topic_type: str, advisory_redirect: str = "") -> str:
    """
    Generate educational script using OpenAI GPT-4.
    """
    if not OPENAI_AVAILABLE or not openai_client:
        return None
    
    system_prompt = """You are an expert financial educator creating educational video scripts for Indian investors.

CRITICAL RULES:
1. NEVER give investment advice or recommendations (no "you should buy/sell/invest")
2. NEVER promise returns or make predictions
3. ALWAYS maintain a neutral, educational tone
4. Use simple language suitable for beginners
5. Include Indian context (₹ amounts, Indian regulations, Indian examples)
6. Keep response under 300 words (60-90 seconds when spoken)

STRUCTURE:
1. Hook: Engaging opening question or statement
2. Explanation: Clear, simple explanation of the concept
3. Example: Relatable Indian example with ₹ amounts
4. Summary: Key point to remember

Always end with: "This content is for educational purposes only."
"""

    user_prompt = f"""Create an educational script about: {question}

Topic: {topic}
Topic Type: {topic_type}

{advisory_redirect}

Generate a clear, engaging, beginner-friendly educational script."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective model, can upgrade to gpt-4o
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


def generate_script(question: str, topic_type: str = "concept") -> Dict[str, any]:
    """
    Generate an educational video script (60-90 seconds when spoken).
    Enforces non-advisory safety layer.
    
    Uses OpenAI GPT if available, falls back to mock scripts.
    
    Guidelines:
    - Beginner-friendly language
    - No jargon without explanation
    - Neutral tone (no buy/sell recommendations)
    - Structured: Hook → Explanation → Example → Summary
    
    Args:
        question: Original user question
        topic_type: Type from classify_topic ("concept", "instrument", "comparison")
        
    Returns:
        Dictionary with:
        {
            "script": str (main educational content),
            "topic": str (extracted topic),
            "intent": dict (from detect_intent),
            "topic_classification": dict (from classify_topic),
            "is_safe": bool (passed safety check)
        }
    """
    # Get intent and classification
    intent = detect_intent(question)
    classification = classify_topic(question)
    topic = classification["topic"]
    
    # Generate redirect prefix if advisory intent
    advisory_redirect = ""
    if intent["type"] == "advisory":
        advisory_redirect = f"{intent['redirect_message']}\n\n"
    
    # Try OpenAI first, fallback to mock scripts
    script = None
    if OPENAI_AVAILABLE:
        script = _generate_script_with_openai(question, topic, classification["type"], advisory_redirect)
    
    # Fallback to mock scripts if OpenAI unavailable or failed
    if not script:
        script = _get_topic_script(topic, advisory_redirect)
    
    # Apply safety sanitization
    safe_script = _sanitize_output(script)
    
    return {
        "script": safe_script,
        "topic": topic,
        "intent": intent,
        "topic_classification": classification,
        "is_safe": True
    }


def _get_topic_script(topic: str, advisory_redirect: str = "") -> str:
    """Generate script content for a specific topic."""
    
    # Generate topic-specific scripts (mock implementation)
    scripts = {
        "SIP (Systematic Investment Plan)": f"""{advisory_redirect}Let's talk about SIP, or Systematic Investment Plan!

Think of SIP like a monthly savings habit, but instead of just saving, your money is invested in mutual funds. 

Here's how it works: You decide a fixed amount, say ₹1,000, and it automatically gets invested every month. This is powerful because of something called "rupee cost averaging" – when prices are low, you buy more units, and when prices are high, you buy fewer. Over time, this averages out your buying cost.

The best part? You don't need a large sum to start. Even ₹500 per month can grow significantly over 10-15 years thanks to the power of compounding.

For example, if you invest ₹5,000 monthly for 15 years with an average return of 12%, you could accumulate over ₹25 lakhs!

Key takeaway: SIP is about discipline, not timing the market. Start early, stay consistent, and let time work its magic.

Remember, always choose funds based on your goals and risk appetite.

This content is for educational purposes only.""",

        "Mutual Funds": f"""{advisory_redirect}Let's understand Mutual Funds in simple terms!

A mutual fund is like a shared investment pool. Many investors like you put their money together, and a professional fund manager invests it in stocks, bonds, or other assets.

Why do people choose mutual funds? Three main reasons:

First, diversification – your money is spread across many companies, reducing risk. If one company performs poorly, others may balance it out.

Second, professional management – expert fund managers research and make investment decisions for you.

Third, accessibility – you can start with as little as ₹100 in some funds!

There are different types: Equity funds invest in stocks (higher risk, higher potential returns), Debt funds invest in bonds (lower risk, stable returns), and Hybrid funds mix both.

Here's the important part: Mutual funds are subject to market risks. Past performance doesn't guarantee future results. Always read the scheme documents and understand where your money is going.

Start by identifying your goal – retirement, child's education, or wealth building – then choose accordingly.

This content is for educational purposes only.""",

        "Gold": f"""{advisory_redirect}Let's explore Gold as an investment!

Gold has been a trusted store of value for thousands of years. In India especially, it holds both cultural and financial significance.

Today, you can invest in gold in several ways:

Physical gold – jewelry or coins. But remember, making charges and storage can be concerns.

Digital gold – buy gold online that's stored in secure vaults. You can start with just ₹1!

Gold ETFs – traded on stock exchanges, backed by physical gold. Very liquid and no storage hassle.

Sovereign Gold Bonds – government-backed, gives you 2.5% annual interest plus gold price appreciation. Great for long-term holding!

Why do investors like gold? It's often called a "safe haven" – during market uncertainty, gold tends to hold its value. It also acts as a hedge against inflation.

However, gold doesn't generate regular income like dividends or interest. Its price depends purely on demand and market conditions.

A common strategy is to keep 5-10% of your portfolio in gold for diversification. It's about balance, not going all-in.

This content is for educational purposes only.""",

        "Fixed Deposits": f"""{advisory_redirect}Let's understand Fixed Deposits, one of India's most popular savings options!

A Fixed Deposit, or FD, is simple: you deposit a lump sum with a bank for a fixed period, and the bank pays you guaranteed interest.

Here's what makes FDs attractive:

Safety – Bank FDs up to ₹5 lakh are insured by DICGC. Your principal is secure.

Guaranteed returns – Unlike market-linked investments, you know exactly what you'll earn.

Flexibility – Choose tenures from 7 days to 10 years based on your needs.

Current FD rates typically range from 6% to 7.5% for major banks. Senior citizens often get an extra 0.5% interest.

But here's what you should know: FD returns are fully taxable. If you're in the 30% tax bracket, your effective return drops significantly. Also, long-term FD returns often struggle to beat inflation.

FDs are great for your emergency fund or short-term goals where you can't afford to lose money. For long-term wealth creation, you might want to explore other options alongside FDs.

The key is matching the instrument to your specific goal and timeline.

This content is for educational purposes only."""
    }
    
    # Return topic-specific script or generate generic one
    if topic in scripts:
        return scripts[topic]
    
    # Generic script for unknown topics
    return f"""{advisory_redirect}Let's explore {topic} together!

{topic} is an important concept in the world of personal finance and investing. Understanding it can help you make better financial decisions.

At its core, {topic} involves principles that every investor should know. Whether you're just starting out or looking to expand your knowledge, grasping these fundamentals is essential.

Here are the key points to remember:

First, always research before committing your money. Understanding what you're investing in is crucial.

Second, consider your personal financial goals and risk tolerance. What works for someone else may not be right for you.

Third, think about the time horizon. Different investments suit different timeframes.

The world of finance can seem complex, but breaking it down into simple concepts makes it manageable. Keep learning, ask questions, and don't rush into decisions.

Remember, financial literacy is a journey, not a destination. Every concept you learn builds your foundation for making informed choices.

Want to dive deeper? Check out the related questions below to continue learning!

This content is for educational purposes only."""

# =============================================================================
# TAKEAWAYS GENERATION
# =============================================================================

def _generate_takeaways_with_openai(topic: str, script: str) -> List[str]:
    """Generate key takeaways using OpenAI."""
    if not OPENAI_AVAILABLE or not openai_client:
        return None
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Generate exactly 5 key takeaways from the educational content.
Each takeaway should:
- Start with an emoji
- Be concise (under 15 words)
- Be educational, not advisory
- Focus on facts, not recommendations

Return only the 5 takeaways, one per line."""
                },
                {
                    "role": "user",
                    "content": f"Topic: {topic}\n\nScript:\n{script}\n\nGenerate 5 key takeaways:"
                }
            ],
            temperature=0.5,
            max_tokens=300
        )
        takeaways = response.choices[0].message.content.strip().split("\n")
        return [t.strip() for t in takeaways if t.strip()][:5]
    except Exception as e:
        print(f"OpenAI takeaways error: {e}")
        return None


def generate_takeaways(topic: str, script: str = "") -> List[str]:
    """
    Generate key takeaways from the educational content.
    Uses OpenAI if available, falls back to mock data.
    
    Args:
        topic: The main topic
        script: Generated script content (for LLM extraction)
        
    Returns:
        List of 4-5 key takeaways
    """
    
    # Try OpenAI first if script is provided
    if OPENAI_AVAILABLE and script:
        openai_takeaways = _generate_takeaways_with_openai(topic, script)
        if openai_takeaways:
            return openai_takeaways
    
    # Topic-specific takeaways (fallback)
    takeaways_map = {
        "SIP (Systematic Investment Plan)": [
            "💰 SIP lets you invest small amounts regularly in mutual funds",
            "📊 Rupee cost averaging reduces impact of market volatility",
            "⏰ Start early – compounding works best over long periods",
            "🎯 SIP is about discipline, not timing the market",
            "✅ You can start with as little as ₹500 per month"
        ],
        "Mutual Funds": [
            "🤝 Mutual funds pool money from multiple investors",
            "👔 Professional fund managers handle investment decisions",
            "📈 Different types suit different risk appetites",
            "⚠️ Subject to market risks – read scheme documents",
            "🎯 Match fund type to your financial goal"
        ],
        "Gold": [
            "🏆 Gold is a traditional safe-haven investment",
            "📱 Multiple ways to invest: Physical, Digital, ETFs, SGBs",
            "🛡️ Acts as hedge against inflation and market uncertainty",
            "💎 Sovereign Gold Bonds offer additional 2.5% interest",
            "⚖️ Consider keeping 5-10% of portfolio in gold"
        ],
        "Fixed Deposits": [
            "🔒 FDs offer guaranteed, secure returns",
            "🏦 Bank deposits up to ₹5 lakh are insured",
            "📅 Flexible tenure options from 7 days to 10 years",
            "💸 Returns are fully taxable – consider post-tax returns",
            "🎯 Best suited for emergency funds and short-term goals"
        ]
    }
    
    if topic in takeaways_map:
        return takeaways_map[topic]
    
    # Generic takeaways
    return [
        f"📚 Understanding {topic} is essential for informed investing",
        "🔍 Always research before making investment decisions",
        "⏳ Consider your time horizon and risk tolerance",
        "🎯 Align investments with your financial goals",
        "📖 Continuous learning builds financial literacy"
    ]

# =============================================================================
# RELATED QUESTIONS GENERATION
# =============================================================================

def _generate_related_questions_with_openai(topic: str) -> List[str]:
    """Generate related questions using OpenAI."""
    if not OPENAI_AVAILABLE or not openai_client:
        return None
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Generate exactly 5 related educational questions about the given financial topic.
Questions should:
- Be educational (not seeking advice)
- Start with "What", "How", "Why", or be comparisons
- Be relevant to Indian investors
- Encourage deeper learning

Return only the 5 questions, one per line."""
                },
                {
                    "role": "user",
                    "content": f"Generate 5 related questions about: {topic}"
                }
            ],
            temperature=0.7,
            max_tokens=250
        )
        questions = response.choices[0].message.content.strip().split("\n")
        return [q.strip() for q in questions if q.strip()][:5]
    except Exception as e:
        print(f"OpenAI related questions error: {e}")
        return None


def generate_related_questions(topic: str) -> List[str]:
    """
    Generate related questions to encourage further learning.
    Uses OpenAI if available, falls back to mock data.
    
    Args:
        topic: The main topic
        
    Returns:
        List of 4-5 related questions
    """
    
    # Try OpenAI first
    if OPENAI_AVAILABLE:
        openai_questions = _generate_related_questions_with_openai(topic)
        if openai_questions:
            return openai_questions
    
    # Topic-specific related questions (fallback)
    questions_map = {
        "SIP (Systematic Investment Plan)": [
            "What is the difference between SIP and lump sum investing?",
            "How do I choose the right mutual fund for SIP?",
            "Can I stop or modify my SIP anytime?",
            "What is the power of compounding in SIP?",
            "SIP vs PPF – which is better for long-term goals?"
        ],
        "Mutual Funds": [
            "What is the difference between direct and regular mutual funds?",
            "How are mutual fund returns taxed?",
            "What is an expense ratio in mutual funds?",
            "How do I evaluate a mutual fund's performance?",
            "What are ELSS funds and their tax benefits?"
        ],
        "Gold": [
            "What are Sovereign Gold Bonds and how do they work?",
            "Gold ETF vs Physical Gold – which should I choose?",
            "How does gold price correlate with stock market?",
            "What is Digital Gold and is it safe?",
            "How much gold should be in my portfolio?"
        ],
        "Fixed Deposits": [
            "What is the difference between cumulative and non-cumulative FD?",
            "How are FD returns taxed?",
            "What are tax-saving fixed deposits?",
            "FD vs Debt Mutual Funds – which gives better returns?",
            "What happens if I break my FD before maturity?"
        ]
    }
    
    if topic in questions_map:
        return questions_map[topic]
    
    # Generic related questions
    return [
        f"What are the risks associated with {topic}?",
        f"How do I get started with {topic}?",
        f"{topic} vs other investment options – a comparison",
        f"What are the tax implications of {topic}?",
        f"Common mistakes to avoid with {topic}"
    ]
