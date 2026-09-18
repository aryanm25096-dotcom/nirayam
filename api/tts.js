import https from 'https';

/**
 * Vercel Serverless Function for /api/tts
 * 
 * Generates natural Indian language speech audio (MP3) for all 11 Indic languages + English.
 * Works 100% on Vercel without requiring local OS voice packages or GPU servers!
 */

function fetchAudio(text, lang) {
  return new Promise((resolve, reject) => {
    // Map language code if needed
    const langMap = {
      hi: 'hi',
      mr: 'mr',
      bn: 'bn',
      ta: 'ta',
      te: 'te',
      gu: 'gu',
      kn: 'kn',
      ml: 'ml',
      pa: 'pa',
      ur: 'ur',
      en: 'en',
      as: 'bn', // Assamese fallback to Bengali phonetics
      or: 'hi', // Odia fallback to Hindi phonetics
    };

    const targetLang = langMap[lang] || 'hi';
    const cleanText = encodeURIComponent(text.slice(0, 300)); // Cap to 300 chars per sentence
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${cleanText}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
        timeout: 7000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`TTS upstream returned status ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 100) {
            reject(new Error('TTS upstream returned empty audio buffer'));
            return;
          }
          resolve(buffer.toString('base64'));
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('TTS request timed out'));
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, language } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const lang = language || 'en';

  // 1. If remote custom IndicF5 URL is configured in Vercel environment variables:
  const INDICF5_URL = process.env.INDICF5_URL;
  if (INDICF5_URL && lang !== 'en') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const upstream = await fetch(INDICF5_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.ok) {
        const data = await upstream.json();
        return res.status(200).json(data);
      }
    } catch (err) {
      console.warn('[Vercel /api/tts] Remote IndicF5 unreachable:', err.message);
    }
  }

  // 2. High-fidelity cloud TTS synthesis for Vercel
  try {
    const audioBase64 = await fetchAudio(text, lang);
    return res.status(200).json({
      audioBase64,
      mimeType: 'audio/mp3',
      language: lang,
    });
  } catch (err) {
    console.warn('[Vercel /api/tts] Cloud TTS error, signaling client fallback:', err.message);
    return res.status(200).json({ useFallback: true, language: lang });
  }
}
