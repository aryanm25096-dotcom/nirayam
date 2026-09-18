/**
 * Web Speech API & IndicF5 TTS Wrapper
 *
 * Integrates:
 * 1. Web Speech API SpeechRecognition for speech-to-text with mock fallback
 * 2. AI4Bharat IndicF5 TTS via /api/tts proxy for 11 Indian languages
 * 3. Browser SpeechSynthesis as a reliable fallback for English ('en') and offline resilience
 */

import { mockSTT } from '../mocks/mockServices.js';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Start speech recognition.
 */
export function startListening({ lang = 'en-IN', onResult, onStart, onEnd, onError }) {
  if (!SpeechRecognition) {
    onStart?.();
    const timeout = setTimeout(async () => {
      try {
        const transcript = await mockSTT();
        onResult?.(transcript);
      } catch {
        onError?.('Mock STT failed');
      } finally {
        onEnd?.();
      }
    }, 1500);

    return {
      stop: () => {
        clearTimeout(timeout);
        onEnd?.();
      },
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => onStart?.();
  recognition.onend = () => onEnd?.();
  recognition.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'no-speech') {
      mockSTT().then((t) => onResult?.(t));
    } else {
      onError?.(e.error);
    }
    onEnd?.();
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript || '';
    onResult?.(transcript);
  };

  recognition.start();

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
    },
  };
}

let activeUtterance = null;

/**
 * Finds the most suitable voice available in the browser for a given BCP-47 language tag.
 */
function findBestVoice(bcp47Tag) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match (e.g. 'hi-IN')
  const exact = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === bcp47Tag.toLowerCase());
  if (exact) return exact;

  // 2. Language prefix match (e.g. 'hi')
  const prefix = bcp47Tag.split('-')[0].toLowerCase();
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  // 3. English or Indian voice match
  const targetPrefix = bcp47Tag.split('-')[0].toLowerCase();
  const regionalMatch = voices.find((v) => {
    const vLang = v.lang.toLowerCase();
    return targetPrefix === 'en' ? vLang.startsWith('en') : vLang.includes('in');
  });
  if (regionalMatch) return regionalMatch;

  // 4. Default voice
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Text-to-speech using the browser's native speechSynthesis API.
 * Used for English ('en') and as the primary offline/error fallback.
 */
export function speakText(text, lang = 'en-IN', onStart, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onStart?.();
    setTimeout(() => onEnd?.(), 100);
    return { cancel: () => {} };
  }

  // Cancel any ongoing speech synthesis and wake up audio queue
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch (e) {
    // ignore
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;

  // Select optimal voice if available
  const voice = findBestVoice(lang);
  if (voice) {
    utterance.voice = voice;
  }

  // Retain utterance reference to avoid Chrome GC bug
  activeUtterance = utterance;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      activeUtterance = null;
      onEnd?.();
    },
  };
}

/**
 * Maps ISO language code to BCP-47 tag for browser SpeechSynthesis fallback
 */
export function getBCP47Tag(lang) {
  const map = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    or: 'or-IN',
    as: 'as-IN',
    ur: 'ur-IN',
  };
  return map[lang] || 'en-IN';
}

/**
 * Speaks text using AI4Bharat's IndicF5 model over /api/tts.
 * Automatically falls back to browser SpeechSynthesis if:
 * 1. Language is English ('en')
 * 2. IndicF5 backend returns useFallback: true
 * 3. IndicF5 backend is unreachable or errors out
 *
 * @param {Object} options
 * @param {string} options.text — Text to synthesize
 * @param {string} options.language — ISO code ('hi', 'mr', 'bn', 'en', etc.)
 * @param {function} [options.onStart]
 * @param {function} [options.onEnd]
 * @param {function} [options.onError]
 * @returns {{ cancel: function }}
 */
export function speakWithIndicF5({ text, language = 'en', onStart, onEnd, onError }) {
  let isCancelled = false;
  let currentAudio = null;
  let fallbackController = null;

  const bcp47 = getBCP47Tag(language);

  onStart?.();

  // Call /api/tts proxy
  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (isCancelled) return;

      if (data.audioBase64) {
        // Detect MIME type (mp3 vs wav)
        const mime = data.mimeType || (data.audioBase64.startsWith('//') ? 'audio/mp3' : 'audio/wav');
        const audioSrc = `data:${mime};base64,${data.audioBase64}`;
        currentAudio = new Audio(audioSrc);

        currentAudio.onended = () => {
          if (!isCancelled) onEnd?.();
        };

        currentAudio.onerror = (e) => {
          console.warn('[IndicF5 Audio] Playback error, using browser TTS fallback:', e);
          if (!isCancelled) {
            fallbackController = speakText(text, bcp47, onStart, onEnd);
          }
        };

        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[IndicF5 Audio] Autoplay blocked or gesture required, falling back to speech synthesis:', err);
            if (!isCancelled) {
              fallbackController = speakText(text, bcp47, onStart, onEnd);
            }
          });
        }
      } else {
        // useFallback or missing audio -> fallback to browser SpeechSynthesis
        if (!isCancelled) {
          fallbackController = speakText(text, bcp47, onStart, onEnd);
        }
      }
    })
    .catch((err) => {
      console.warn('[IndicF5 TTS] Backend request failed, falling back to browser SpeechSynthesis:', err.message);
      if (!isCancelled) {
        fallbackController = speakText(text, bcp47, onStart, onEnd);
      }
    });

  return {
    cancel: () => {
      isCancelled = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (fallbackController) {
        fallbackController.cancel();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      onEnd?.();
    },
  };
}
