
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnalysisResult } from '../types';
import ReliabilityGauge from '../components/ReliabilityGauge';
import { ArrowLeft, Share2, ExternalLink, CheckCircle2, XCircle, Info, Calendar, Copy, Check, ShieldCheck, Twitter } from 'lucide-react';

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`analysis_${id}`);
    if (saved) {
      const data: AnalysisResult = JSON.parse(saved);
      setResult(data);
      // Immediately set the title for the 'thumbnail' effect when link is shared
      document.title = `${data.score}% Reliable: ${data.verdict} - checkSourceAI`;
    }
    window.scrollTo(0, 0);

    return () => {
      document.title = 'checkSourceAI - Fact Check & Verify';
    };
  }, [id]);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
           <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Analysis Not Found</h2>
        <p className="text-slate-500 mb-10 mt-3 text-lg font-medium">This report might have expired or never existed.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg">
          <ArrowLeft className="w-5 h-5" />
          Go to Home
        </Link>
      </div>
    );
  }

  const getPermalink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const query = encodeURIComponent(result.originalText);
    return `${baseUrl}#/?q=${query}`;
  };

  const handleShare = () => {
    const url = getPermalink();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPostText = `[checkSourceAI: ${result.score}% Reliable] ${result.verdict}\n\nSummary: ${result.summary}\n\nFull Analysis: ${getPermalink()}`;

  const handleCopyPost = () => {
    navigator.clipboard.writeText(socialPostText);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'Reliable': return 'bg-green-100 text-green-700 border-green-200';
      case 'Partially Reliable': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Unreliable': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all group text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Verification
        </Link>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleShare}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all font-bold shadow-sm active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link Copied!' : 'Copy Report Link'}
          </button>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(socialPostText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white hover:bg-black rounded-xl transition-all font-bold shadow-lg active:scale-95"
          >
            <Twitter className="w-4 h-4" />
            Share to X
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full border-l border-b border-slate-100 flex items-center justify-center pointer-events-none">
               <ShieldCheck className="w-10 h-10 text-slate-100" />
            </div>
            
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-5 py-2 rounded-full text-xs font-black border uppercase tracking-[0.2em] shadow-sm ${getVerdictStyles(result.verdict)}`}>
                  {result.verdict}
                </span>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  {new Date(result.timestamp).toLocaleDateString()}
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-400 uppercase tracking-tighter mb-4">Original Subject</h1>
              <div className="text-2xl font-medium text-slate-800 leading-snug border-l-4 border-blue-500 pl-6 py-2 italic bg-blue-50/30 rounded-r-2xl">
                "{result.originalText}"
              </div>
            </div>

            <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-lg shadow-blue-200">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                   <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-xl mb-2 tracking-tight">AI Detailed Verdict</h4>
                  <p className="text-blue-50 leading-relaxed text-lg">{result.summary}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12">
            <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Key Claims Cross-Check</h2>
            <div className="grid gap-8">
              {result.keyClaims.map((claim, idx) => (
                <div key={idx} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {claim.isVerified ? (
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{claim.claim}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{claim.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Copy className="w-6 h-6 text-blue-400" />
                  Social Content Ready
                </h3>
                <p className="text-slate-500 mt-2 font-medium">Verified text formatted for high-trust sharing.</p>
              </div>
              <button 
                onClick={handleCopyPost}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                {copiedPost ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copiedPost ? 'Copied to Clipboard' : 'Copy Full Post'}
              </button>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl font-mono text-sm text-slate-300 whitespace-pre-wrap border border-slate-700/50 leading-relaxed">
              {socialPostText}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 text-center sticky top-24">
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Reliability Index</h3>
            <div className="relative mb-6">
              <ReliabilityGauge score={result.score} />
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-5xl font-black ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-bold px-4 leading-relaxed">
              Analyzed using deep grounding across {result.sources.length} authoritative sources.
            </p>
            
            <div className="mt-10 pt-10 border-t border-slate-100">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Verified Sources</h3>
               <div className="space-y-3">
                {result.sources.length > 0 ? (
                  result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-2xl transition-all group border border-slate-100 hover:border-blue-200"
                    >
                      <span className="text-xs font-bold line-clamp-1">{source.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic font-bold">Primary sources confirmed but restricted.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;