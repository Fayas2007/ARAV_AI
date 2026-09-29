"""
gemini.py – Google Gemini integration for ARAV AI English assistant.
Uses google-genai async SDK with fast flash-lite models for lightning-fast (<1.5s) responses.
"""
from __future__ import annotations
import os
import asyncio
import logging
from typing import List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

# Lightning-fast models (gemini-3.5-flash-lite averages 1.2-1.5s)
MODEL_CASCADE = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
]

_client: Optional[genai.Client] = None


def get_client() -> genai.Client:
    global _client
    api_key = os.getenv("GEMINI_API_KEY", "") or "demo-key"
    if _client is None:
        _client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=10000),
        )
    return _client


SYSTEM_PROMPT = """You are ARAV AI – an intelligent, highly responsive cooperative governance and agricultural assistant for Indian farmers, cooperative society members, and rural citizens.

Your core guidelines:
1. Provide accurate, clear, and actionable answers strictly in English.
2. Answer directly and concisely with clear bullet points and bold key terms.
3. Help with:
   - Primary Agricultural Credit Societies (PACS) membership, services, loans, and bylaws
   - Cooperative laws and governance (Multi-State Co-operative Societies Act, State Cooperative Acts)
   - Government schemes (PM-KISAN, PMFBY crop insurance, Kisan Credit Card / KCC at 4% subvention, AIF, NCDC)
   - Application procedures, required documents, and grievance redressal
4. Keep answers fast, crisp, practical, and helpful without unnecessary filler.
5. If verified statutory/knowledge context is provided, incorporate it accurately into your answer.
"""


def build_contents_for_gemini(
    messages: list[dict],
    current_prompt: str,
) -> list[types.Content]:
    """Convert conversation history and current user prompt to Gemini Content objects."""
    contents: list[types.Content] = []
    
    # Add recent history (up to last 6 messages for high speed)
    for msg in messages[-6:]:
        text = (msg.get("content") or "").strip()
        if not text:
            continue
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=text)],
            )
        )
    
    # Add the current user prompt
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=current_prompt)],
        )
    )
    return contents


def _generate_fallback_response(user_message: str, knowledge_context: str) -> str:
    """Instant local fallback in case network/Gemini API is unreachable."""
    if knowledge_context:
        return (
            "Based on the ARAV AI Cooperative Governance & Schemes knowledge base:\n\n"
            f"{knowledge_context}\n\n"
            "For further assistance, please visit your local Primary Agricultural Credit Society (PACS) or District Central Cooperative Bank."
        )
    else:
        return (
            "Welcome to ARAV AI. I can assist you with Primary Agricultural Credit Societies (PACS), cooperative bylaws, Kisan Credit Card (KCC), PMFBY crop insurance, PM-KISAN, and government agricultural schemes. Please ask your question."
        )


async def generate_response(
    user_message: str,
    language: str = "en",
    conversation_history: Optional[List[dict]] = None,
    knowledge_context: str = "",
) -> str:
    """
    Generate a chatbot response answering the user's question using Gemini.
    Async, non-blocking, and optimized for sub-1.5s latency strictly in English.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured. Using fallback response.")
        return _generate_fallback_response(user_message, knowledge_context)

    # Build prompt instructions strictly in English
    prompt_sections = []
    if knowledge_context:
        prompt_sections.append(
            f"Relevant official knowledge context:\n{knowledge_context}"
        )
    prompt_sections.append(f"User Question: {user_message}")
    current_prompt = "\n\n".join(prompt_sections)

    contents = build_contents_for_gemini(conversation_history or [], current_prompt)

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.2,
        max_output_tokens=700,
    )

    try:
        client = get_client()
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return _generate_fallback_response(user_message, knowledge_context)

    # Try models in cascade
    for model_name in MODEL_CASCADE:
        try:
            logger.info(f"Generating response using async model: {model_name}")
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if response and response.text and response.text.strip():
                logger.info(f"Successfully generated response with model: {model_name}")
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Model '{model_name}' error: {e}. Trying next available model...")
            continue

    logger.error("All Gemini models failed. Falling back to local knowledge base.")
    return _generate_fallback_response(user_message, knowledge_context)


def verify_model_available() -> bool:
    """Check if primary fast Gemini model is accessible."""
    try:
        client = get_client()
        res = client.models.generate_content(
            model=MODEL_CASCADE[0],
            contents="Hello",
            config=types.GenerateContentConfig(max_output_tokens=5),
        )
        return bool(res and res.text)
    except Exception as e:
        logger.warning(f"Gemini model check failed: {e}")
        return False
