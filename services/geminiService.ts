import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GeminiResponseSchema, Source } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function verifyPost(content: string): Promise<AnalysisResult> {
  // Using Pro for complex fact-checking tasks
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model: model,
    contents: `Fact-check the following social media content. Verify if the claims are true, identify the primary sources, and provide a reliability score from 0 (completely fictional/unreliable) to 100 (fully verified/reliable). 
    
    Content: "${content}"`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Reliability score from 0 to 100" },
          summary: { type: Type.STRING, description: "A concise summary of the verification results" },
          verdict: { type: Type.STRING, description: "One of: Reliable, Partially Reliable, Unreliable, or Fictional" },
          claims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                verified: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              },
              required: ["claim", "verified", "explanation"]
            }
          }
        },
        required: ["score", "summary", "verdict", "claims"]
      }
    },
  });

  // Correct way to access text property
  const rawText = response.text || "";
  let data: GeminiResponseSchema;
  
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Analysis failed. The AI response was malformed.");
  }

  const sources: Source[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  groundingChunks.forEach((chunk: any) => {
    if (chunk.web?.uri && chunk.web?.title) {
      sources.push({
        url: chunk.web.uri,
        title: chunk.web.title
      });
    }
  });

  const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  const result: AnalysisResult = {
    id: Math.random().toString(36).substring(2, 15),
    originalText: content,
    timestamp: Date.now(),
    score: data.score,
    summary: data.summary,
    verdict: data.verdict as any,
    keyClaims: data.claims.map(c => ({
      claim: c.claim,
      isVerified: c.verified,
      explanation: c.explanation
    })),
    sources: uniqueSources
  };

  return result;
}