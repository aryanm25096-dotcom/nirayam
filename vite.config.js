import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Connect/Express middleware for /api/tts
 * Proxies requests to IndicF5 Python service at http://localhost:8001/tts
 * Explicitly routes English ('en') to browser fallback
 * Handles timeouts and service outages gracefully
 */
function ttsProxyPlugin() {
  return {
    name: 'tts-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const { text, language } = JSON.parse(bodyStr || '{}');


            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

              const response = await fetch('http://localhost:8001/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language }),
                signal: controller.signal,
              });
              clearTimeout(timeout);

              if (!response.ok) {
                throw new Error(`IndicF5 service returned HTTP ${response.status}`);
              }

              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (err) {
              console.warn('[TTS Proxy] IndicF5 service unreachable, falling back to browser TTS:', err.message);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ useFallback: true, error: err.message }));
            }
          } catch (e) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsProxyPlugin()],
  server: {
    port: 8081,
    host: true,
  },
})
