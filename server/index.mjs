import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const PORT = process.env.PORT || 3001;
const apiKey = process.env.GENAI_API_KEY || process.env.API_KEY;
const shareSecret = process.env.SHARE_SIGNING_SECRET || '';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';

const app = express();
app.use(cors());
app.use(express.json());

if (!apiKey) {
  console.warn('GENAI API key not set. Set GENAI_API_KEY in .env');
}

const ai = new GoogleGenAI({ apiKey });

const clampScore = (value) => {
  const score = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(score)) return 0;
  return Math.min(100, Math.max(0, score));
};

const sanitizeText = (value, maxLen = 140) => {
  if (!value) return '';
  const raw = String(value).replace(/\s+/g, ' ').trim();
  return raw.length > maxLen ? `${raw.slice(0, maxLen - 1)}…` : raw;
};

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const scoreColor = (score) => {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
};

const verdictEmoji = (verdict) => {
  const text = String(verdict || '').toLowerCase();
  if (text.includes('reliable') && !text.includes('partially')) return '✅';
  if (text.includes('partially')) return '⚠️';
  if (text.includes('unreliable') || text.includes('fiction')) return '❌';
  return '🔎';
};

const base64UrlEncode = (value) => {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (value) => {
  const padded = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const normalized = padded + '='.repeat(padLen);
  return Buffer.from(normalized, 'base64').toString('utf-8');
};

const signSharePayload = (payload) => {
  if (!shareSecret) return '';
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = base64UrlEncode(
    crypto.createHmac('sha256', shareSecret).update(body).digest()
  );
  return `${body}.${sig}`;
};

const verifyShareToken = (token) => {
  if (!shareSecret || !token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = base64UrlEncode(
    crypto.createHmac('sha256', shareSecret).update(body).digest()
  );
  try {
    const match = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!match) return null;
    return JSON.parse(base64UrlDecode(body));
  } catch (err) {
    return null;
  }
};

app.get('/og', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Share token required');
  const payload = verifyShareToken(token);
  if (!payload) return res.status(400).send('Invalid share token');

  const score = clampScore(payload.score);
  const verdict = sanitizeText(payload.verdict || 'Unknown', 36);
  const summary = sanitizeText(payload.summary || 'Fact-check summary', 140);
  const color = scoreColor(score);
  const emoji = verdictEmoji(verdict);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>
  <rect width="800" height="800" rx="56" fill="url(#bg)" />
  <circle cx="640" cy="160" r="120" fill="#1f2937" opacity="0.85" />
  <circle cx="690" cy="210" r="46" fill="${color}" opacity="0.85" />
  <rect x="64" y="64" width="220" height="44" rx="22" fill="url(#accent)" />
  <text x="88" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="#ffffff">checkSourceAI</text>

  <text x="64" y="170" font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#94a3b8">Reliability Snapshot</text>

  <text x="64" y="360" font-family="'Arial Black', 'Segoe UI', sans-serif" font-size="150" fill="${color}">${score}</text>
  <text x="330" y="360" font-family="'Segoe UI', Arial, sans-serif" font-size="36" fill="#cbd5f5">/ 100</text>

  <text x="64" y="450" font-family="'Segoe UI', Arial, sans-serif" font-size="34" fill="#e2e8f0">${escapeHtml(emoji)} ${escapeHtml(verdict)}</text>
  <text x="64" y="510" font-family="'Segoe UI', Arial, sans-serif" font-size="26" fill="#94a3b8">${escapeHtml(summary)}</text>

  <rect x="64" y="610" width="300" height="58" rx="29" fill="${color}" />
  <text x="100" y="648" font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#ffffff">View Full Analysis →</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

app.get('/share', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Share token required');
  const payload = verifyShareToken(token);
  if (!payload) return res.status(400).send('Invalid share token');

  const score = clampScore(payload.score);
  const verdict = sanitizeText(payload.verdict || 'Unknown', 36);
  const summary = sanitizeText(payload.summary || 'Fact-check summary', 200);
  const text = sanitizeText(payload.text || '', 140);
  const site = sanitizeText(payload.site || '', 200);
  const q = sanitizeText(payload.q || '', 200);
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const baseUrl = `${proto}://${host}`;

  const ogParams = new URLSearchParams({
    token: String(token)
  });
  const ogImage = `${baseUrl}/og?${ogParams.toString()}`;

  const shareTitle = `${score}% Reliable • ${verdict}`;
  const shareDesc = summary || text || 'View the reliability snapshot.';
  const canonical = `${baseUrl}/share?token=${encodeURIComponent(String(token))}`;

  const siteLink = site ? `${site}#/?q=${encodeURIComponent(q || text)}` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(shareTitle)} - checkSourceAI</title>
    <meta name="description" content="${escapeHtml(shareDesc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(shareTitle)}" />
    <meta property="og:description" content="${escapeHtml(shareDesc)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(shareTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(shareDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  </head>
  <body style="margin:0; font-family: 'Segoe UI', Arial, sans-serif; background:#0f172a; color:#e2e8f0;">
    <div style="max-width:720px; margin:0 auto; padding:48px 24px; text-align:center;">
      <h1 style="margin:0 0 12px;">checkSourceAI</h1>
      <p style="margin:0 0 24px; color:#94a3b8;">Reliability Snapshot</p>
      <img src="${escapeHtml(ogImage)}" alt="Reliability snapshot" style="width:100%; border-radius:24px; box-shadow:0 24px 60px rgba(0,0,0,0.35);" />
      ${siteLink ? `<p style=\"margin:28px 0 0;\"><a href=\"${escapeHtml(siteLink)}\" style=\"color:#38bdf8; text-decoration:none; font-weight:600;\">Open full analysis →</a></p>` : ''}
    </div>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(html);
});

app.post('/api/verify', async (req, res) => {
  const { content } = req.body || {};
  if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content is required' });

  try {
    const model = 'gemini-3-pro-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Fact-check the following social media content. Verify claims, identify primary sources, and provide a reliability score from 0 to 100.\n\nContent: "${content}"`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            verdict: { type: Type.STRING },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING },
                  verified: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const rawText = response.text || '';
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      return res.status(500).json({ error: 'AI returned malformed JSON', rawText });
    }

    // Collect grounding sources if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = [];
    groundingChunks.forEach((chunk) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ url: chunk.web.uri, title: chunk.web.title });
      }
    });

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

    const result = {
      id: Math.random().toString(36).substring(2, 15),
      originalText: content,
      timestamp: Date.now(),
      score: data.score ?? 0,
      summary: data.summary ?? '',
      verdict: data.verdict ?? 'Unknown',
      keyClaims: (data.claims || []).map((c) => ({ claim: c.claim, isVerified: !!c.verified, explanation: c.explanation })),
      sources: uniqueSources
    };

    if (shareSecret && publicBaseUrl) {
      const payload = {
        score: result.score,
        verdict: result.verdict,
        summary: result.summary,
        text: result.originalText,
        site: process.env.PUBLIC_SITE_URL || '',
        q: result.originalText,
        ts: result.timestamp
      };
      const token = signSharePayload(payload);
      const shareHost = String(publicBaseUrl).replace(/\/+$/, '');
      result.shareToken = token;
      result.shareUrl = `${shareHost}/share?token=${encodeURIComponent(token)}`;
    }

    res.json(result);
  } catch (err) {
    console.error('verify error', err);
    res.status(500).json({ error: 'Verification failed', details: String(err) });
  }
});

// Serve frontend static files if present (after running `npm run build`)
const distPath = path.join(process.cwd(), 'dist');

try {
  const fs = await import('fs');

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
} catch (e) {
  console.warn('Could not check dist path:', e?.message || e);
}


app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
