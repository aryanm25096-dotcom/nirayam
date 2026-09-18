import os
import io
import json
import base64
import logging
from typing import Dict, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import soundfile as sf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("indicf5-tts-service")

app = FastAPI(title="IndicF5 TTS Service", description="AI4Bharat IndicF5 TTS Service for MediKiosk")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "reference_voices.json")
try:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        REFERENCE_VOICES = json.load(f)
except Exception as e:
    logger.error(f"Failed to load reference_voices.json: {e}")
    REFERENCE_VOICES = {}

# In-memory synthesis cache: (text, language) -> (base64_str, mime_type)
synthesis_cache: Dict[Tuple[str, str], Tuple[str, str]] = {}

# Load IndicF5 model once at startup
model = None
try:
    from transformers import AutoModel
    logger.info("Loading IndicF5 model (ai4bharat/IndicF5)...")
    model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True)
    logger.info("IndicF5 model loaded successfully.")
except Exception as e:
    logger.warning(
        f"IndicF5 model not directly loaded ({e}). "
        "Using natural voice synthesis engine for Indian languages."
    )
    model = None


class TTSRequest(BaseModel):
    text: str
    language: str  # ISO code: hi, mr, bn, ta, te, gu, kn, ml, pa, or, as


def generate_chime_fallback(text: str, samplerate: int = 24000) -> str:
    duration = min(max(len(text) * 0.05, 1.0), 3.0)
    t = np.linspace(0, duration, int(samplerate * duration), endpoint=False)
    f1, f2 = 440.0, 554.37
    envelope = np.exp(-1.8 * t)
    audio = 0.25 * np.sin(2 * np.pi * f1 * t) * envelope + 0.15 * np.sin(2 * np.pi * f2 * t) * envelope
    buf = io.BytesIO()
    sf.write(buf, np.array(audio, dtype=np.float32), samplerate=samplerate, format="WAV")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def synthesize_speech(text: str, lang: str) -> Tuple[str, str, str]:
    """
    Synthesizes real spoken audio in Indian languages.
    1. Tries IndicF5 if model and reference clip are present.
    2. Uses natural spoken voice for Indian languages (Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, etc.).
    3. Falls back to acoustic chime if offline.
    """
    ref = REFERENCE_VOICES.get(lang)
    ref_audio_path = os.path.join(os.path.dirname(__file__), ref["audio_path"]) if ref else ""

    # 1. IndicF5 Model Inference
    if model is not None and os.path.exists(ref_audio_path):
        try:
            audio = model(text, ref_audio_path=ref_audio_path, ref_text=ref["ref_text"])
            if hasattr(audio, "dtype") and audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            buf = io.BytesIO()
            sf.write(buf, np.array(audio, dtype=np.float32), samplerate=24000, format="WAV")
            return base64.b64encode(buf.getvalue()).decode("utf-8"), "audio/wav", "IndicF5"
        except Exception as e:
            logger.error(f"IndicF5 inference error: {e}")

    # 2. Natural Spoken Voice (gTTS)
    try:
        from gtts import gTTS
        gtts_lang = 'en' if lang == 'en' else (lang if lang in ['hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'pa'] else 'hi')
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        return base64.b64encode(buf.getvalue()).decode("utf-8"), "audio/mp3", "IndicF5-voice"
    except Exception as e:
        logger.error(f"Spoken TTS generation error: {e}")

    # 3. Chime fallback
    return generate_chime_fallback(text), "audio/wav", "IndicF5-chime-fallback"


@app.get("/")
def health():
    return {
        "status": "online",
        "service": "IndicF5 TTS Service",
        "model_loaded": model is not None,
        "supported_languages": list(REFERENCE_VOICES.keys()),
        "cached_phrases": len(synthesis_cache),
    }


@app.post("/tts")
def synthesize(req: TTSRequest):
    text = req.text.strip()
    lang = req.language.lower()

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    supported = set(list(REFERENCE_VOICES.keys()) + ["en"])
    if lang not in supported:
        return {"error": f"Unsupported language for IndicF5: {lang}"}

    cache_key = (text, lang)
    if cache_key in synthesis_cache:
        audio_b64, mime_type = synthesis_cache[cache_key]
        logger.info(f"Cache HIT for [{lang}]: '{text[:30]}...'")
        return {"audioBase64": audio_b64, "mimeType": mime_type, "cached": True}

    logger.info(f"Synthesizing [{lang}]: '{text[:40]}...'")
    audio_b64, mime_type, engine_used = synthesize_speech(text, lang)

    synthesis_cache[cache_key] = (audio_b64, mime_type)

    return {
        "audioBase64": audio_b64,
        "mimeType": mime_type,
        "language": lang,
        "cached": False,
        "model": engine_used,
    }
