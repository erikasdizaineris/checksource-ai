import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AnalysisDetail from './pages/AnalysisDetail';
import { ShieldCheck, Info, MessageSquare, Twitter, Github } from 'lucide-react';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">checkSourceAI</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">API</a>
                <Link to="/" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:id" element={<AnalysisDetail />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <span className="text-xl font-bold text-slate-900">checkSourceAI</span>
                </div>
                <p className="text-slate-500 max-w-sm mb-6">
                  Protecting the digital conversation by providing accessible, fast, and accurate fact-checking tools for everyone.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-blue-400 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Fact Checker</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Source API</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Browser Extension</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Methodology</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <p>© 2024 checkSourceAI. Powered by Google Gemini.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-slate-600 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;