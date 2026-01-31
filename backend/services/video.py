"""
Video Service - AI Video Generation using AIML API
===================================================
Generates educational videos using Kling AI via AIML API

Features:
- Text-to-video generation
- Async video generation with status polling
- Multiple video models available
"""

import os
import httpx
import asyncio
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =============================================================================
# CONFIGURATION
# =============================================================================

AIML_API_KEY = os.getenv("AIML_API_KEY", "")
AIML_API_URL = "https://api.aimlapi.com"

# Default video model - Kling 1.5 Pro (good quality, reasonable speed)
DEFAULT_VIDEO_MODEL = "kling-video/v1.5/pro/text-to-video"

# Alternative models:
# "kling-video/v1/standard/text-to-video" - Faster, lower quality
# "kling-video/v1.6/pro/text-to-video" - Higher quality
# "luma/ray-2" - Luma Dream Machine
# "veo2" - Google Veo 2

# Check if AIML API is available
AIML_AVAILABLE = bool(AIML_API_KEY)
if AIML_AVAILABLE:
    print("✅ AIML API (Video Generation) initialized successfully")
else:
    print("⚠️ AIML API key not configured - video generation disabled")

# =============================================================================
# VIDEO GENERATION
# =============================================================================

async def generate_video(
    prompt: str,
    model: str = DEFAULT_VIDEO_MODEL,
    duration: int = 5
) -> Optional[Dict[str, Any]]:
    """
    Start video generation from text prompt.
    
    Args:
        prompt: Text description for video
        model: Video model to use
        duration: Video duration in seconds (5 or 10)
        
    Returns:
        Dictionary with generation_id and status
    """
    if not AIML_AVAILABLE:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{AIML_API_URL}/v2/generate/video/kling/generation",
                headers={
                    "Authorization": f"Bearer {AIML_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "prompt": prompt,
                    "duration": str(duration)
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "generation_id": data.get("id"),
                    "status": data.get("status"),
                    "credits_used": data.get("meta", {}).get("usage", {}).get("credits_used", 0)
                }
            else:
                print(f"AIML API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"Video generation error: {e}")
        return None


def generate_video_sync(
    prompt: str,
    model: str = DEFAULT_VIDEO_MODEL,
    duration: int = 5
) -> Optional[Dict[str, Any]]:
    """
    Start video generation (sync version).
    """
    if not AIML_AVAILABLE:
        return None
    
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{AIML_API_URL}/v2/generate/video/kling/generation",
                headers={
                    "Authorization": f"Bearer {AIML_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "prompt": prompt,
                    "duration": str(duration)
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "generation_id": data.get("id"),
                    "status": data.get("status"),
                    "credits_used": data.get("meta", {}).get("usage", {}).get("credits_used", 0)
                }
            else:
                print(f"AIML API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"Video generation error: {e}")
        return None


# =============================================================================
# STATUS CHECKING
# =============================================================================

async def check_video_status(generation_id: str) -> Optional[Dict[str, Any]]:
    """
    Check the status of a video generation.
    
    Args:
        generation_id: The ID returned from generate_video
        
    Returns:
        Dictionary with status and video URL (if complete)
    """
    if not AIML_AVAILABLE:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{AIML_API_URL}/v2/generate/video/kling/generation",
                params={"generation_id": generation_id},
                headers={
                    "Authorization": f"Bearer {AIML_API_KEY}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                result = {
                    "generation_id": data.get("id"),
                    "status": data.get("status"),
                }
                
                # If completed, include video URL
                if data.get("status") == "completed":
                    video_data = data.get("video", {})
                    # Handle video.url format (object with url property)
                    if isinstance(video_data, dict) and "url" in video_data:
                        result["video_url"] = video_data["url"]
                    # Handle videos list format
                    elif isinstance(video_data, list) and len(video_data) > 0:
                        result["video_url"] = video_data[0].get("url", video_data[0]) if isinstance(video_data[0], dict) else video_data[0]
                    # Handle direct string
                    elif isinstance(video_data, str):
                        result["video_url"] = video_data
                    # Also check for direct url field
                    if "url" in data and not result.get("video_url"):
                        result["video_url"] = data["url"]
                
                return result
            else:
                print(f"Status check error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"Status check error: {e}")
        return None


def check_video_status_sync(generation_id: str) -> Optional[Dict[str, Any]]:
    """
    Check video status (sync version).
    """
    if not AIML_AVAILABLE:
        return None
    
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{AIML_API_URL}/v2/generate/video/kling/generation",
                params={"generation_id": generation_id},
                headers={
                    "Authorization": f"Bearer {AIML_API_KEY}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                result = {
                    "generation_id": data.get("id"),
                    "status": data.get("status"),
                }
                
                if data.get("status") == "completed":
                    video_data = data.get("video", {})
                    # Handle video.url format (object with url property)
                    if isinstance(video_data, dict) and "url" in video_data:
                        result["video_url"] = video_data["url"]
                    # Handle videos list format
                    elif isinstance(video_data, list) and len(video_data) > 0:
                        result["video_url"] = video_data[0].get("url", video_data[0]) if isinstance(video_data[0], dict) else video_data[0]
                    # Handle direct string
                    elif isinstance(video_data, str):
                        result["video_url"] = video_data
                    # Also check for direct url field
                    if "url" in data and not result.get("video_url"):
                        result["video_url"] = data["url"]
                
                return result
            else:
                return None
                
    except Exception as e:
        print(f"Status check error: {e}")
        return None


# =============================================================================
# PROMPT GENERATION FOR FINANCIAL CONTENT
# =============================================================================

def create_educational_video_prompt(topic: str, style: str = "professional") -> str:
    """
    Create an optimized prompt for financial educational videos.
    
    Args:
        topic: The financial topic (e.g., "SIP", "Mutual Funds")
        style: Visual style ("professional", "animated", "whiteboard")
        
    Returns:
        Optimized prompt for video generation
    """
    styles = {
        "professional": (
            f"A professional educational video about {topic}. "
            "Clean modern office setting with a friendly financial advisor. "
            "Soft lighting, neutral colors, professional but approachable. "
            "Charts and graphs appearing on screen. High quality, 4K, educational style."
        ),
        "animated": (
            f"Animated explainer video about {topic}. "
            "Colorful 2D animation with smooth transitions. "
            "Infographics and icons representing financial concepts. "
            "Friendly, engaging, educational cartoon style."
        ),
        "whiteboard": (
            f"Whiteboard animation explaining {topic}. "
            "Hand drawing diagrams and text on white background. "
            "Clean, simple illustrations appearing progressively. "
            "Educational, clear, minimalist style."
        )
    }
    
    return styles.get(style, styles["professional"])


# =============================================================================
# AVAILABLE MODELS
# =============================================================================

def get_available_models() -> list:
    """Get list of available video models."""
    return [
        {"id": "kling-video/v1/standard/text-to-video", "name": "Kling 1.0 Standard", "speed": "fast", "quality": "good"},
        {"id": "kling-video/v1.5/pro/text-to-video", "name": "Kling 1.5 Pro", "speed": "medium", "quality": "high"},
        {"id": "kling-video/v1.6/pro/text-to-video", "name": "Kling 1.6 Pro", "speed": "medium", "quality": "very high"},
        {"id": "luma/ray-2", "name": "Luma Ray-2", "speed": "fast", "quality": "high"},
        {"id": "veo2", "name": "Google Veo 2", "speed": "slow", "quality": "premium"},
    ]
