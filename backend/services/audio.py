"""
Audio Service - Text-to-Speech using ElevenLabs
================================================
Generates audio narration for educational scripts

Features:
- High-quality AI voice synthesis
- Multiple voice options
- Audio caching for efficiency
"""

import os
import httpx
import base64
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =============================================================================
# CONFIGURATION
# =============================================================================

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

# Default voice - "Rachel" is a clear, professional female voice
# You can change this to any voice_id from ElevenLabs
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel - clear, professional

# Alternative voices:
# "ErXwobaYiN019PkySvjV" - Antoni (male, warm)
# "VR6AewLTigWG4xSOukaG" - Arnold (male, authoritative)
# "pNInz6obpgDQGcFmaJgB" - Adam (male, deep)

# Audio settings
AUDIO_MODEL = "eleven_multilingual_v2"  # Best quality, supports multiple languages
AUDIO_FORMAT = "mp3_44100_128"  # Good quality MP3

# Check if ElevenLabs is available
ELEVENLABS_AVAILABLE = bool(ELEVENLABS_API_KEY)
if ELEVENLABS_AVAILABLE:
    print("✅ ElevenLabs API initialized successfully")
else:
    print("⚠️ ElevenLabs API key not configured - audio generation disabled")

# =============================================================================
# VOICE MANAGEMENT
# =============================================================================

async def get_available_voices() -> list:
    """Get list of available voices from ElevenLabs."""
    if not ELEVENLABS_AVAILABLE:
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ELEVENLABS_API_URL}/voices",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            if response.status_code == 200:
                data = response.json()
                return [
                    {"voice_id": v["voice_id"], "name": v["name"]}
                    for v in data.get("voices", [])[:10]  # Return top 10 voices
                ]
    except Exception as e:
        print(f"Error fetching voices: {e}")
    return []


def get_available_voices_sync() -> list:
    """Get list of available voices (sync version)."""
    if not ELEVENLABS_AVAILABLE:
        return []
    
    try:
        with httpx.Client() as client:
            response = client.get(
                f"{ELEVENLABS_API_URL}/voices",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            if response.status_code == 200:
                data = response.json()
                return [
                    {"voice_id": v["voice_id"], "name": v["name"]}
                    for v in data.get("voices", [])[:10]
                ]
    except Exception as e:
        print(f"Error fetching voices: {e}")
    return []


# =============================================================================
# TEXT-TO-SPEECH GENERATION
# =============================================================================

async def generate_audio(
    text: str,
    voice_id: str = DEFAULT_VOICE_ID,
    model_id: str = AUDIO_MODEL
) -> Optional[Dict[str, Any]]:
    """
    Generate audio from text using ElevenLabs API.
    
    Args:
        text: The script text to convert to speech
        voice_id: ElevenLabs voice ID
        model_id: ElevenLabs model ID
        
    Returns:
        Dictionary with:
        {
            "audio_base64": str (base64 encoded audio),
            "content_type": str (audio/mpeg),
            "duration_estimate": float (estimated duration in seconds)
        }
    """
    if not ELEVENLABS_AVAILABLE:
        return None
    
    # Clean and prepare text
    clean_text = _prepare_text_for_speech(text)
    
    if not clean_text or len(clean_text) < 10:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{ELEVENLABS_API_URL}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                },
                json={
                    "text": clean_text,
                    "model_id": model_id,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }
            )
            
            if response.status_code == 200:
                audio_bytes = response.content
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                
                # Estimate duration (rough: ~150 words per minute for narration)
                word_count = len(clean_text.split())
                duration_estimate = (word_count / 150) * 60  # in seconds
                
                return {
                    "audio_base64": audio_base64,
                    "content_type": "audio/mpeg",
                    "duration_estimate": round(duration_estimate, 1),
                    "word_count": word_count,
                    "voice_id": voice_id
                }
            else:
                print(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"Audio generation error: {e}")
        return None


def generate_audio_sync(
    text: str,
    voice_id: str = DEFAULT_VOICE_ID,
    model_id: str = AUDIO_MODEL
) -> Optional[Dict[str, Any]]:
    """
    Generate audio from text (sync version).
    """
    if not ELEVENLABS_AVAILABLE:
        return None
    
    clean_text = _prepare_text_for_speech(text)
    
    if not clean_text or len(clean_text) < 10:
        return None
    
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{ELEVENLABS_API_URL}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                },
                json={
                    "text": clean_text,
                    "model_id": model_id,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }
            )
            
            if response.status_code == 200:
                audio_bytes = response.content
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                
                word_count = len(clean_text.split())
                duration_estimate = (word_count / 150) * 60
                
                return {
                    "audio_base64": audio_base64,
                    "content_type": "audio/mpeg",
                    "duration_estimate": round(duration_estimate, 1),
                    "word_count": word_count,
                    "voice_id": voice_id
                }
            else:
                print(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"Audio generation error: {e}")
        return None


# =============================================================================
# TEXT PREPARATION
# =============================================================================

def _prepare_text_for_speech(text: str) -> str:
    """
    Prepare text for speech synthesis.
    - Remove markdown formatting
    - Remove emojis (optional)
    - Clean up special characters
    """
    import re
    
    # Remove disclaimer emoji but keep the text
    text = text.replace("⚠️", "Note:")
    
    # Remove other emojis (keep text clean for speech)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", 
        flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    
    # Remove markdown bold/italic
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    
    # Replace bullet points with pauses
    text = text.replace('•', '...')
    text = text.replace('- ', '... ')
    
    # Clean up multiple spaces/newlines
    text = re.sub(r'\n+', ' ... ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


# =============================================================================
# USAGE TRACKING
# =============================================================================

async def get_usage_info() -> Optional[Dict[str, Any]]:
    """Get current API usage information."""
    if not ELEVENLABS_AVAILABLE:
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ELEVENLABS_API_URL}/user/subscription",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "character_count": data.get("character_count", 0),
                    "character_limit": data.get("character_limit", 0),
                    "tier": data.get("tier", "free")
                }
    except Exception as e:
        print(f"Error fetching usage: {e}")
    return None
