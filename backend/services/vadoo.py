"""
Vadoo AI Video Service
======================
Generates educational videos using Vadoo AI API

Features:
- Text-to-video generation with custom scripts
- Multiple topics and styles
- AI voiceover and captions
- Multiple languages supported

API Docs: https://docs.vadoo.tv/
"""

import os
import httpx
import asyncio
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =============================================================================
# CONFIGURATION
# =============================================================================

VADOO_API_KEY = os.getenv("VADOO_API_KEY", "")
VADOO_API_URL = "https://viralapi.vadoo.tv/api"

# Check if Vadoo API is available
VADOO_AVAILABLE = bool(VADOO_API_KEY)
if VADOO_AVAILABLE:
    print("✅ Vadoo AI API initialized successfully")
else:
    print("⚠️ Vadoo API key not configured - Vadoo video generation disabled")

# =============================================================================
# VIDEO GENERATION
# =============================================================================

async def generate_video(
    script: str,
    topic: str = "Custom",
    duration: str = "30-60",
    language: str = "English",
    aspect_ratio: str = "16:9",
    voice: str = "Charlie",
    theme: str = "Hormozi_1",
    include_voiceover: str = "1"
) -> Optional[Dict[str, Any]]:
    """
    Generate video from script using Vadoo AI.
    
    Args:
        script: Custom script for the video (when topic is "Custom")
        topic: Video topic - "Custom" for custom scripts, or predefined topics
        duration: Video duration - "30-60", "60-90", "90-120", "5 min", "10 min"
        language: Language for the video
        aspect_ratio: Video aspect ratio - "9:16", "1:1", "16:9"
        voice: Voice for narration
        theme: Caption style theme
        include_voiceover: "1" to include AI voiceover, "0" to disable
        
    Returns:
        Dictionary with video_id and status
    """
    if not VADOO_AVAILABLE:
        return {"error": "Vadoo API not configured"}
    
    try:
        # Build request body
        body = {
            "topic": topic,
            "duration": duration,
            "language": language,
            "aspect_ratio": aspect_ratio,
            "voice": voice,
            "theme": theme,
            "include_voiceover": include_voiceover,
            "use_ai": "1"
        }
        
        # Add custom script if topic is "Custom"
        if topic == "Custom" and script:
            body["prompt"] = script  # Vadoo uses 'prompt' for custom scripts
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{VADOO_API_URL}/generate_video",
                headers={
                    "X-API-KEY": VADOO_API_KEY,
                    "Content-Type": "application/json"
                },
                json=body
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "video_id": data.get("vid"),
                    "status": "processing",
                    "message": "Video generation started. Will be ready in 2-3 minutes."
                }
            else:
                print(f"Vadoo API error: {response.status_code} - {response.text}")
                return {"error": f"API error: {response.status_code}", "details": response.text}
                
    except Exception as e:
        print(f"Vadoo video generation error: {e}")
        return {"error": str(e)}


def generate_video_sync(
    script: str,
    topic: str = "Custom",
    duration: str = "30-60",
    language: str = "English",
    aspect_ratio: str = "16:9"
) -> Optional[Dict[str, Any]]:
    """Synchronous wrapper for generate_video"""
    return asyncio.run(generate_video(
        script=script,
        topic=topic,
        duration=duration,
        language=language,
        aspect_ratio=aspect_ratio
    ))


# =============================================================================
# GET AVAILABLE OPTIONS
# =============================================================================

async def get_topics() -> List[str]:
    """Get available video topics"""
    if not VADOO_AVAILABLE:
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{VADOO_API_URL}/get_topics",
                headers={"X-API-KEY": VADOO_API_KEY}
            )
            
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        print(f"Error getting topics: {e}")
        return []


async def get_voices() -> List[str]:
    """Get available voices"""
    if not VADOO_AVAILABLE:
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{VADOO_API_URL}/get_voices",
                headers={"X-API-KEY": VADOO_API_KEY}
            )
            
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        print(f"Error getting voices: {e}")
        return []


async def get_languages() -> List[str]:
    """Get available languages"""
    if not VADOO_AVAILABLE:
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{VADOO_API_URL}/get_languages",
                headers={"X-API-KEY": VADOO_API_KEY}
            )
            
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        print(f"Error getting languages: {e}")
        return []


async def get_themes() -> List[str]:
    """Get available caption themes"""
    if not VADOO_AVAILABLE:
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{VADOO_API_URL}/get_themes",
                headers={"X-API-KEY": VADOO_API_KEY}
            )
            
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        print(f"Error getting themes: {e}")
        return []


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_educational_prompt(topic: str, key_points: List[str] = None) -> str:
    """
    Create an educational video prompt for Indian investors.
    
    Args:
        topic: Main topic for the video
        key_points: Optional list of key points to cover
        
    Returns:
        Formatted prompt string
    """
    prompt = f"""Create an educational video about {topic} for Indian investors.

Key requirements:
- Use simple, clear language suitable for beginners
- Include relevant examples from Indian markets (NSE, BSE, NIFTY, SENSEX)
- Mention practical tips for Indian investors
- Keep the tone professional but engaging
"""
    
    if key_points:
        prompt += "\n\nKey points to cover:\n"
        for i, point in enumerate(key_points, 1):
            prompt += f"{i}. {point}\n"
    
    return prompt


def get_duration_for_script_length(script_length: int) -> str:
    """
    Get appropriate duration based on script character count.
    
    Duration limits:
    - 30-60: 1000 characters
    - 60-90: 1500 characters  
    - 90-120: 2000 characters
    - 120-180: 2500 characters
    - 5 min: 5000 characters
    - 10 min: 10000 characters
    """
    if script_length <= 1000:
        return "30-60"
    elif script_length <= 1500:
        return "60-90"
    elif script_length <= 2000:
        return "90-120"
    elif script_length <= 2500:
        return "120-180"
    elif script_length <= 5000:
        return "5 min"
    else:
        return "10 min"


# =============================================================================
# CHECK API STATUS
# =============================================================================

async def check_api_status() -> Dict[str, Any]:
    """Check if Vadoo API is accessible and working"""
    if not VADOO_AVAILABLE:
        return {"available": False, "error": "API key not configured"}
    
    try:
        topics = await get_topics()
        return {
            "available": True,
            "topics_count": len(topics),
            "sample_topics": topics[:3] if topics else []
        }
    except Exception as e:
        return {"available": False, "error": str(e)}


# =============================================================================
# MAIN - FOR TESTING
# =============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def test():
        print("\n=== Testing Vadoo AI API ===\n")
        
        # Check API status
        status = await check_api_status()
        print(f"API Status: {status}")
        
        # Get available options
        topics = await get_topics()
        print(f"\nAvailable topics: {topics}")
        
        voices = await get_voices()
        print(f"\nAvailable voices: {voices[:5] if voices else 'None'}...")
        
        languages = await get_languages()
        print(f"\nAvailable languages: {languages[:5] if languages else 'None'}...")
    
    asyncio.run(test())
