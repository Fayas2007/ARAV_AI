"""
voice.py – High-speed Speech-to-Text and Text-to-Speech provider integration.
Supports Gemini native multimodal audio transcription (<1.5s) using GEMINI_API_KEY,
with fallback to Google Cloud STT/TTS.
"""
from __future__ import annotations
import os
import logging
from typing import Optional, Tuple

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

STT_PROVIDER = os.getenv("STT_PROVIDER", "gemini").lower()
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "none").lower()
STT_API_KEY = os.getenv("STT_API_KEY", "")
TTS_API_KEY = os.getenv("TTS_API_KEY", "")

# BCP-47 language codes for Indian languages
LANGUAGE_CODES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
}


async def _gemini_stt(audio_bytes: bytes, mime_type: str = "audio/mp4") -> Tuple[str, float]:
    """Transcribe audio directly using Google Gemini's native multimodal audio engine."""
    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is required for Gemini STT")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=15000),
    )

    clean_mime = "audio/mp4"
    if "wav" in mime_type:
        clean_mime = "audio/wav"
    elif "ogg" in mime_type:
        clean_mime = "audio/ogg"
    elif "webm" in mime_type:
        clean_mime = "audio/webm"
    elif "mp3" in mime_type or "mpeg" in mime_type:
        clean_mime = "audio/mp3"

    part = types.Part.from_bytes(data=audio_bytes, mime_type=clean_mime)
    prompt = (
        "You are an expert audio transcriber for rural India, cooperative societies, and agriculture. "
        "Listen to this audio and transcribe the exact words spoken in English. "
        "Return ONLY the transcribed text. Do NOT add any preamble, quotes, explanations, or notes. "
        "If the audio is silence or unintelligible noise, return an empty string."
    )

    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=[part, prompt],
        config=types.GenerateContentConfig(
            temperature=0.0,
            max_output_tokens=300,
        ),
    )

    transcript = response.text.strip() if response and response.text else ""
    return transcript, 0.95


async def _google_stt(audio_bytes: bytes, lang_code: str, mime_type: str) -> Tuple[str, float]:
    """Google Cloud Speech-to-Text v1 REST API fallback."""
    import base64
    import httpx

    if not STT_API_KEY:
        raise RuntimeError("STT_API_KEY is required for Google STT provider")

    encoding_map = {
        "audio/webm": "WEBM_OPUS",
        "audio/mp4": "MP3",
        "audio/wav": "LINEAR16",
        "audio/ogg": "OGG_OPUS",
    }
    encoding = encoding_map.get(mime_type, "WEBM_OPUS")

    audio_b64 = base64.b64encode(audio_bytes).decode()
    payload = {
        "config": {
            "encoding": encoding,
            "languageCode": lang_code,
            "model": "latest_long",
            "enableAutomaticPunctuation": True,
        },
        "audio": {"content": audio_b64},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://speech.googleapis.com/v1/speech:recognize?key={STT_API_KEY}",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results", [])
    if not results:
        return "", 0.0

    alt = results[0].get("alternatives", [{}])[0]
    transcript = alt.get("transcript", "")
    confidence = alt.get("confidence", 0.0)
    return transcript, confidence


async def transcribe_audio(
    audio_bytes: bytes,
    language: str = "en",
    mime_type: str = "audio/mp4",
) -> Tuple[str, float]:
    """
    Transcribe audio bytes to text.
    Uses Gemini native multimodal audio with automatic fallback to Google Cloud STT.
    """
    if os.getenv("GEMINI_API_KEY"):
        try:
            return await _gemini_stt(audio_bytes, mime_type)
        except Exception as e:
            logger.warning(f"Gemini audio transcription failed: {e}. Trying secondary provider...")

    if STT_PROVIDER == "google" and STT_API_KEY:
        lang_code = LANGUAGE_CODES.get(language, "en-IN")
        return await _google_stt(audio_bytes, lang_code, mime_type)

    raise RuntimeError("Speech-to-text is unavailable. Ensure GEMINI_API_KEY is configured in backend/.env.")


async def synthesize_speech(text: str, language: str = "en") -> Optional[bytes]:
    """Synthesize text to audio bytes (MP3)."""
    lang_code = LANGUAGE_CODES.get(language, "en-IN")

    if TTS_PROVIDER == "google" and TTS_API_KEY:
        return await _google_tts(text, lang_code)
    return None


async def _google_tts(text: str, lang_code: str) -> bytes:
    """Google Cloud Text-to-Speech v1 REST API."""
    import httpx
    import base64

    if not TTS_API_KEY:
        raise RuntimeError("TTS_API_KEY is required for Google TTS provider")

    voice_map = {
        "en-IN": "en-IN-Standard-A",
        "hi-IN": "hi-IN-Standard-A",
        "ta-IN": "ta-IN-Standard-A",
        "te-IN": "te-IN-Standard-A",
    }
    voice_name = voice_map.get(lang_code, "en-IN-Standard-A")

    payload = {
        "input": {"text": text},
        "voice": {"languageCode": lang_code, "name": voice_name},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": 0.95},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://texttospeech.googleapis.com/v1/text:synthesize?key={TTS_API_KEY}",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    audio_b64 = data.get("audioContent", "")
    return base64.b64decode(audio_b64)
