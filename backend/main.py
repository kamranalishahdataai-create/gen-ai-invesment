"""
GenAI Investment Learning Platform - Backend API
================================================
Phase 2: Enhanced API with safety layer and real market data

This API provides:
- Question processing with intent detection
- Educational script generation with safety enforcement
- Market data (real API with mock fallback)

SAFETY FEATURES:
- Hard non-advisory enforcement
- Automatic disclaimer injection
- No buy/sell recommendations

API ENDPOINTS:
- POST /ask - Process educational questions
- GET /market-data - Get asset market data (gold, inflation, index)
- GET /macro/{country} - Get macroeconomic indicators
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from services.llm import (
    detect_intent,
    classify_topic,
    generate_script,
    generate_takeaways,
    generate_related_questions,
    extract_topic,
    is_valid_financial_topic
)
from services.market_data import (
    get_market_data,
    get_normalized_market_data,
    compare_instruments,
    is_financial_instrument
)
from services.audio import (
    generate_audio,
    get_available_voices,
    ELEVENLABS_AVAILABLE
)
from services.video import (
    generate_video,
    check_video_status,
    create_educational_video_prompt,
    get_available_models as get_video_models,
    AIML_AVAILABLE
)
from services.vadoo import (
    generate_video as vadoo_generate_video,
    get_topics as vadoo_get_topics,
    get_voices as vadoo_get_voices,
    get_languages as vadoo_get_languages,
    get_themes as vadoo_get_themes,
    create_educational_prompt as vadoo_create_prompt,
    get_duration_for_script_length,
    check_api_status as vadoo_check_status,
    VADOO_AVAILABLE
)

# =============================================================================
# APP CONFIGURATION
# =============================================================================

app = FastAPI(
    title="GenAI Investment Learning Platform",
    description="AI-powered educational platform for investment learning (Phase 2)",
    version="2.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# CONSTANTS
# =============================================================================

EDUCATIONAL_DISCLAIMER = (
    "⚠️ Disclaimer: This content is for educational purposes only and does not "
    "constitute financial advice. Please consult a certified financial advisor "
    "before making any investment decisions."
)

# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class QuestionRequest(BaseModel):
    """Request model for the /ask endpoint"""
    question: str = Field(..., min_length=3, max_length=500, description="User's investment question")

class MarketDataResponse(BaseModel):
    """Response model for market data"""
    instrument: str
    price: str
    trend: str
    trend_direction: str  # "up", "down", "neutral"
    metrics: dict
    last_updated: str

class AskResponse(BaseModel):
    """Response model for the /ask endpoint"""
    intent: str
    intent_details: Optional[dict] = None
    topic: str
    topic_type: Optional[str] = None
    script: str
    key_takeaways: List[str]
    related_questions: List[str]
    disclaimer: str
    market_data: Optional[dict] = None
    comparison: Optional[dict] = None
    is_safe: bool = True


class MarketDataNormalizedResponse(BaseModel):
    """Normalized response model for market data"""
    name: str
    current_value: str
    change: str
    trend: str
    last_updated: str
    source: Optional[str] = "Demo Data"
    metrics: Optional[dict] = None

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "phase": "Phase 2 - Enhanced",
        "message": "GenAI Investment Learning Platform API is running",
        "features": [
            "Intent detection with confidence",
            "Topic classification",
            "Safety layer enforcement",
            "Real market data with fallback"
        ]
    }

@app.post("/ask", response_model=AskResponse)
def ask_question(req: QuestionRequest):
    """
    Main endpoint for processing user questions.
    
    Flow:
    1. Validate topic is related to investment/finance/macroeconomy
    2. Detect intent (educational vs advisory) with confidence
    3. Classify topic type (concept / instrument / comparison)
    4. Generate educational script with safety layer
    5. Generate key takeaways
    6. Generate related questions
    7. Fetch market data if topic is a financial instrument
    
    Returns structured response with all components for frontend display.
    """
    try:
        # Step 0: Validate topic is finance/investment related
        topic_validation = is_valid_financial_topic(req.question)
        if not topic_validation["is_valid"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "off_topic",
                    "message": topic_validation["reason"],
                    "suggestion": "Please ask questions about investment, finance, or macroeconomy topics like mutual funds, stocks, SIP, gold, inflation, interest rates, or financial planning."
                }
            )
        
        # Step 1: Detect user intent with confidence
        intent_result = detect_intent(req.question)
        
        # Step 2: Classify the topic
        classification = classify_topic(req.question)
        topic = classification["topic"]
        
        # Step 3: Generate educational script with safety layer
        script_result = generate_script(req.question, classification["type"])
        script = script_result["script"]
        
        # Step 4: Generate key takeaways
        takeaways = generate_takeaways(topic, script)
        
        # Step 5: Generate related questions
        related = generate_related_questions(topic)
        
        # Step 6: Check if topic is a financial instrument and get market data
        market_data = None
        comparison = None
        
        if is_financial_instrument(topic):
            market_data = get_market_data(topic)
            comparison = compare_instruments(topic)
        
        return AskResponse(
            intent=intent_result["type"],
            intent_details=intent_result,
            topic=topic,
            topic_type=classification["type"],
            script=script,
            key_takeaways=takeaways,
            related_questions=related,
            disclaimer=EDUCATIONAL_DISCLAIMER,
            market_data=market_data,
            comparison=comparison,
            is_safe=script_result.get("is_safe", True)
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions (like off-topic validation)
        raise
        
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Error processing question: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question. Please try again."
        )


@app.get("/market-data", response_model=MarketDataNormalizedResponse)
def market_data(
    asset: str = Query(
        ..., 
        description="Asset type: gold, inflation, or index",
        example="gold"
    )
):
    """
    Get market data for a specific asset in normalized format.
    
    Supported assets:
    - gold: Gold price data
    - inflation: India CPI inflation
    - index: Nifty 50 index
    
    Returns normalized format:
    {
        name, current_value, change, trend, last_updated
    }
    """
    try:
        valid_assets = ["gold", "inflation", "index", "nifty"]
        if asset.lower() not in valid_assets:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid asset. Supported: {', '.join(valid_assets)}"
            )
        
        data = get_normalized_market_data(asset)
        return MarketDataNormalizedResponse(**data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching market data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market data")


@app.get("/market-data/{instrument}")
def market_data_by_instrument(instrument: str):
    """
    Get detailed market data for a specific instrument.
    
    Returns full market data including metrics and comparison info.
    """
    try:
        if not instrument or len(instrument) < 2:
            raise HTTPException(status_code=400, detail="Invalid instrument name")
        
        data = get_market_data(instrument)
        if not data:
            raise HTTPException(status_code=404, detail=f"No data found for {instrument}")
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching market data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market data")

@app.get("/compare")
def compare(left: str, right: str = None):
    """
    Compare two financial instruments.
    
    Args:
        left: Primary instrument
        right: Secondary instrument (optional, uses default if not provided)
    """
    try:
        if not left:
            raise HTTPException(status_code=400, detail="Primary instrument must be specified")
        
        return compare_instruments(left, right)
        
    except Exception as e:
        print(f"Error comparing instruments: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare instruments")


# =============================================================================
# MACROECONOMIC DATA ENDPOINTS
# =============================================================================

MACRO_DATA = {
    "india": {
        "inflation": {"value": "5.22%", "trend": "down", "change": "-0.3%"},
        "policyRate": {"value": "6.50%", "trend": "stable", "name": "Repo Rate"},
        "gdpGrowth": {"value": "7.8%", "trend": "up", "change": "+0.5%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "83.12", "pair": "USD/INR", "trend": "stable"},
        "govtBorrowing": {"value": "₹15.43L Cr", "trend": "up", "fiscalYear": "FY24"},
    },
    "usa": {
        "inflation": {"value": "3.4%", "trend": "down", "change": "-0.2%"},
        "policyRate": {"value": "5.50%", "trend": "stable", "name": "Fed Funds Rate"},
        "gdpGrowth": {"value": "2.9%", "trend": "up", "change": "+0.3%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "104.5", "pair": "USD Index", "trend": "up"},
        "govtBorrowing": {"value": "$34.1T", "trend": "up", "fiscalYear": "2024"},
    },
    "uk": {
        "inflation": {"value": "4.0%", "trend": "down", "change": "-0.6%"},
        "policyRate": {"value": "5.25%", "trend": "stable", "name": "Bank Rate"},
        "gdpGrowth": {"value": "0.6%", "trend": "stable", "change": "+0.1%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "0.79", "pair": "USD/GBP", "trend": "down"},
        "govtBorrowing": {"value": "£2.6T", "trend": "up", "fiscalYear": "2024"},
    },
    "eu": {
        "inflation": {"value": "2.8%", "trend": "down", "change": "-0.4%"},
        "policyRate": {"value": "4.50%", "trend": "stable", "name": "ECB Rate"},
        "gdpGrowth": {"value": "0.5%", "trend": "stable", "change": "0%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "0.92", "pair": "USD/EUR", "trend": "stable"},
        "govtBorrowing": {"value": "€13.4T", "trend": "up", "fiscalYear": "2024"},
    },
    "japan": {
        "inflation": {"value": "2.8%", "trend": "up", "change": "+0.2%"},
        "policyRate": {"value": "0.10%", "trend": "up", "name": "BOJ Rate"},
        "gdpGrowth": {"value": "1.9%", "trend": "up", "change": "+0.4%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "149.50", "pair": "USD/JPY", "trend": "up"},
        "govtBorrowing": {"value": "¥1,286T", "trend": "up", "fiscalYear": "2024"},
    },
    "china": {
        "inflation": {"value": "0.2%", "trend": "down", "change": "-0.3%"},
        "policyRate": {"value": "3.45%", "trend": "down", "name": "LPR"},
        "gdpGrowth": {"value": "5.2%", "trend": "down", "change": "-0.3%"},
        "crudeOil": {"value": "$82.45", "trend": "up", "change": "+2.1%"},
        "currency": {"value": "7.24", "pair": "USD/CNY", "trend": "up"},
        "govtBorrowing": {"value": "¥30T", "trend": "up", "fiscalYear": "2024"},
    },
}

@app.get("/macro/{country}")
def get_macro_data(country: str):
    """
    Get macroeconomic data for a specific country.
    
    Supported countries: india, usa, uk, eu, japan, china
    
    Returns key indicators: inflation, policy rate, GDP growth, currency, etc.
    """
    try:
        country_lower = country.lower()
        
        if country_lower not in MACRO_DATA:
            raise HTTPException(
                status_code=404, 
                detail=f"No data available for {country}. Supported: india, usa, uk, eu, japan, china"
            )
        
        return {
            "country": country_lower,
            "data": MACRO_DATA[country_lower],
            "last_updated": "2026-01-09",
            "source": "Demo Data",
            "disclaimer": "This data is for educational purposes only."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching macro data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch macroeconomic data")


# =============================================================================
# AUDIO GENERATION ENDPOINTS
# =============================================================================

class AudioRequest(BaseModel):
    """Request model for audio generation"""
    text: str = Field(..., min_length=10, max_length=5000, description="Text to convert to speech")
    voice_id: str = Field(default="21m00Tcm4TlvDq8ikWAM", description="ElevenLabs voice ID")


@app.post("/generate-audio")
async def generate_audio_endpoint(request: AudioRequest):
    """
    Generate audio narration from text using ElevenLabs.
    
    Returns base64 encoded audio that can be played in the browser.
    """
    if not ELEVENLABS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Audio generation is not available. ElevenLabs API key not configured."
        )
    
    try:
        audio_data = await generate_audio(request.text, request.voice_id)
        
        if not audio_data:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate audio. Please try again."
            )
        
        return {
            "success": True,
            "audio_base64": audio_data["audio_base64"],
            "content_type": audio_data["content_type"],
            "duration_estimate": audio_data["duration_estimate"],
            "word_count": audio_data["word_count"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Audio generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")


@app.get("/voices")
async def list_voices():
    """
    Get list of available ElevenLabs voices.
    """
    if not ELEVENLABS_AVAILABLE:
        return {"voices": [], "available": False}
    
    try:
        voices = await get_available_voices()
        return {"voices": voices, "available": True}
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return {"voices": [], "available": False}


@app.get("/audio-status")
def audio_status():
    """
    Check if audio generation is available.
    """
    return {
        "available": ELEVENLABS_AVAILABLE,
        "provider": "ElevenLabs" if ELEVENLABS_AVAILABLE else None
    }


# =============================================================================
# VIDEO GENERATION ENDPOINTS
# =============================================================================

class VideoRequest(BaseModel):
    """Request model for video generation"""
    topic: str = Field(..., min_length=2, max_length=200, description="Topic for video")
    style: str = Field(default="professional", description="Video style: professional, animated, whiteboard")
    duration: int = Field(default=5, description="Video duration in seconds (5 or 10)")
    model: str = Field(default="kling-video/v1.5/pro/text-to-video", description="Video model to use")


@app.post("/generate-video")
async def generate_video_endpoint(request: VideoRequest):
    """
    Start video generation for a financial topic.
    
    Returns generation_id to check status later.
    Video generation takes 2-5 minutes.
    """
    if not AIML_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video generation is not available. AIML API key not configured."
        )
    
    try:
        # Create optimized prompt for the topic
        prompt = create_educational_video_prompt(request.topic, request.style)
        
        # Start video generation
        result = await generate_video(
            prompt=prompt,
            model=request.model,
            duration=request.duration
        )
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to start video generation. Please try again."
            )
        
        return {
            "success": True,
            "generation_id": result["generation_id"],
            "status": result["status"],
            "message": "Video generation started. Check status using /video-status endpoint.",
            "estimated_time": "2-5 minutes"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Video generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate video")


@app.get("/video-status/{generation_id}")
async def video_status_endpoint(generation_id: str):
    """
    Check the status of a video generation.
    
    Statuses: queued, generating, completed, failed
    """
    if not AIML_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video generation is not available."
        )
    
    try:
        result = await check_video_status(generation_id)
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail="Video generation not found or status check failed."
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check video status")


@app.get("/video-models")
def list_video_models():
    """
    Get list of available video generation models.
    """
    return {
        "available": AIML_AVAILABLE,
        "models": get_video_models() if AIML_AVAILABLE else []
    }


@app.get("/video-service-status")
def video_service_status():
    """
    Check if video generation service is available.
    """
    return {
        "available": AIML_AVAILABLE,
        "provider": "AIML API (Kling AI)" if AIML_AVAILABLE else None
    }


# =============================================================================
# VADOO AI VIDEO GENERATION ENDPOINTS
# =============================================================================

class VadooVideoRequest(BaseModel):
    """Request model for Vadoo AI video generation"""
    script: str = Field(default="", min_length=0, max_length=10000, description="Script for the video (required for Custom topic)")
    topic: str = Field(default="Custom", description="Video topic - use 'Custom' for custom scripts")
    duration: str = Field(default="30-60", description="Video duration: 30-60, 60-90, 90-120, 5 min, 10 min")
    language: str = Field(default="English", description="Language for the video")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 9:16, 1:1, 16:9")
    voice: str = Field(default="Alloy", description="Voice for narration")
    theme: str = Field(default="Hormozi_1", description="Caption style theme")


@app.post("/vadoo/generate-video")
async def vadoo_generate_video_endpoint(request: VadooVideoRequest):
    """
    Generate video using Vadoo AI.
    
    Features:
    - Custom scripts support (use topic="Custom" and provide script)
    - Preset topics available (Fun Facts, Motivational, etc.)
    - Multiple languages
    - AI voiceover
    - Automatic captions
    
    Returns video_id. Video will be ready in 2-3 minutes.
    """
    if not VADOO_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Vadoo AI video generation is not available. API key not configured."
        )
    
    # Validate: Custom topic requires a script
    if request.topic == "Custom" and (not request.script or len(request.script) < 10):
        raise HTTPException(
            status_code=400,
            detail="Custom topic requires a script with at least 10 characters."
        )
    
    try:
        # Auto-detect optimal duration based on script length
        if request.script:
            optimal_duration = get_duration_for_script_length(len(request.script))
            duration = request.duration if request.duration != "auto" else optimal_duration
        else:
            duration = request.duration
        
        result = await vadoo_generate_video(
            script=request.script,
            topic=request.topic,
            duration=duration,
            language=request.language,
            aspect_ratio=request.aspect_ratio,
            voice=request.voice,
            theme=request.theme
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "success": True,
            "video_id": result.get("video_id"),
            "status": result.get("status"),
            "message": "Video generation started. Will be ready in 2-3 minutes.",
            "estimated_time": "2-3 minutes",
            "note": "Video URL will be sent to webhook when ready. Videos expire in 30 minutes."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Vadoo video generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate video")


@app.get("/vadoo/topics")
async def vadoo_topics_endpoint():
    """Get list of available Vadoo AI video topics"""
    if not VADOO_AVAILABLE:
        return {"topics": [], "available": False}
    
    try:
        topics = await vadoo_get_topics()
        return {"topics": topics, "available": True}
    except Exception as e:
        print(f"Error fetching Vadoo topics: {e}")
        return {"topics": [], "available": False}


@app.get("/vadoo/voices")
async def vadoo_voices_endpoint():
    """Get list of available Vadoo AI voices"""
    if not VADOO_AVAILABLE:
        return {"voices": [], "available": False}
    
    try:
        voices = await vadoo_get_voices()
        return {"voices": voices, "available": True}
    except Exception as e:
        print(f"Error fetching Vadoo voices: {e}")
        return {"voices": [], "available": False}


@app.get("/vadoo/languages")
async def vadoo_languages_endpoint():
    """Get list of supported languages"""
    if not VADOO_AVAILABLE:
        return {"languages": [], "available": False}
    
    try:
        languages = await vadoo_get_languages()
        return {"languages": languages, "available": True}
    except Exception as e:
        print(f"Error fetching languages: {e}")
        return {"languages": [], "available": False}


@app.get("/vadoo/themes")
async def vadoo_themes_endpoint():
    """Get list of available caption themes"""
    if not VADOO_AVAILABLE:
        return {"themes": [], "available": False}
    
    try:
        themes = await vadoo_get_themes()
        return {"themes": themes, "available": True}
    except Exception as e:
        print(f"Error fetching themes: {e}")
        return {"themes": [], "available": False}


@app.get("/vadoo/status")
async def vadoo_status_endpoint():
    """Check Vadoo AI service status"""
    if not VADOO_AVAILABLE:
        return {
            "available": False,
            "provider": None,
            "message": "Vadoo AI API key not configured"
        }
    
    try:
        status = await vadoo_check_status()
        return {
            "available": status.get("available", False),
            "provider": "Vadoo AI",
            "topics_count": status.get("topics_count", 0),
            "sample_topics": status.get("sample_topics", [])
        }
    except Exception as e:
        return {
            "available": False,
            "provider": "Vadoo AI",
            "error": str(e)
        }


@app.get("/all-video-services")
def all_video_services():
    """
    Get status of all video generation services.
    """
    return {
        "aiml": {
            "available": AIML_AVAILABLE,
            "provider": "AIML API (Kling AI)",
            "description": "High-quality AI video generation (5-10 sec)",
            "generation_time": "2-5 minutes"
        },
        "vadoo": {
            "available": VADOO_AVAILABLE,
            "provider": "Vadoo AI",
            "description": "Full educational videos with voiceover and captions",
            "generation_time": "2-3 minutes",
            "durations": ["30-60 sec", "60-90 sec", "90-120 sec", "5 min", "10 min"]
        }
    }

