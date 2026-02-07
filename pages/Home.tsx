import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPost } from '../services/geminiService';
import { Search, ShieldCheck, Link as LinkIcon, AlertCircle, Loader2, Command } from 'lucide-react';

const Home: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleVerify = useCallback(async (textToVerify: string) => {
    if (!textToVerify.trim()) return;

    setLoading(true);
    setError('');

    let finalContent = textToVerify.trim();
    
    // Command pattern matching: checksourceai "text" or checksourceai text
    const commandRegex = /^checksourceai\s+(?:"(.+)"|(.+))$/i;
    const match = finalContent.match(commandRegex);
    
    if (match) {
      finalContent = match[1] || match[2];
    }
    
    try {
      const result = await verifyPost(finalContent);
      localStorage.setItem(`analysis_${result.id}`, JSON.stringify(result));
      navigate(`/analysis/${result.id}`);
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try a clearer claim or news headline.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const queryText = searchParams.get('q');
    if (queryText && !loading) {
      setContent(queryText);
      handleVerify(queryText);
    }
  }, [searchParams, handleVerify, loading]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(content);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          Reliability Verification v1.0
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Verify Truth with <span className="text-blue-600">checkSourceAI</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The ultimate service to verify social media posts. Get a detailed reliability score and a shareable truth link.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-2 mb-12 border border-slate-100 overflow-hidden ring-1 ring-slate-200">
        <div className="p-6 md:p-8 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-6 rounded-[1.8rem]">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <ShieldCheck className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">Analyzing Sources...</h3>
                <p className="text-slate-500 font-medium">Fact-checking against global data</p>
              </div>
            </div>
          )}

          <form onSubmit={onFormSubmit}>
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                <Command className="w-4 h-4" />
                Content or Command
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Paste content or use: checksourceai "Global sea levels are rising faster than expected"'
                className="w-full h-44 p-6 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 transition-all resize-none text-slate-800 text-lg font-medium placeholder:text-slate-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                loading || !content.trim() 
                  ? 'bg-slate-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              <Search className="w-6 h-6" />
              Run Analysis
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, title: "Fact Grounding", desc: "Using Gemini 3 Pro with Google Search for deep verification." },
          { icon: <div className="font-black text-green-600">0-100</div>, title: "Reliability Scores", desc: "Transparent scoring based on evidence and source quality." },
          { icon: <LinkIcon className="w-6 h-6 text-purple-600" />, title: "Proof Links", desc: "Generate unique links to share verification reports anywhere." }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              {feat.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{feat.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;