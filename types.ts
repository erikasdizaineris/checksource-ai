
export interface Source {
  url: string;
  title: string;
}

export interface AnalysisResult {
  id: string;
  originalText: string;
  timestamp: number;
  score: number;
  summary: string;
  keyClaims: ClaimVerification[];
  sources: Source[];
  verdict: 'Reliable' | 'Partially Reliable' | 'Unreliable' | 'Fictional';
}

export interface ClaimVerification {
  claim: string;
  isVerified: boolean;
  explanation: string;
}

export interface GeminiResponseSchema {
  score: number;
  summary: string;
  verdict: string;
  claims: {
    claim: string;
    verified: boolean;
    explanation: string;
  }[];
}
