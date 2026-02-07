import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 3001;
const apiKey = process.env.GENAI_API_KEY || process.env.API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

if (!apiKey) {
  console.warn('GENAI API key not set. Set GENAI_API_KEY in .env');
}

const ai = new GoogleGenAI({ apiKey });

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

    res.json(result);
  } catch (err) {
    console.error('verify error', err);
    res.status(500).json({ error: 'Verification failed', details: String(err) });
  }
});

// Serve frontend static files if present (after running `npm run build`)
// When started from the project root, `dist` will be at <root>/dist.
const distPath = path.join(process.cwd(), 'dist');
try {
  // Only serve if the directory exists
  // eslint-disable-next-line no-unused-vars
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
