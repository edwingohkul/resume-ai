import React, { useState } from 'react';
import ResumeBuilder from './components/ResumeBuilder';
import ATSScanner from './components/ATSScanner';
import { ResumeData } from './types';
import { FileText, Search, Menu, X } from './components/ui/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'scanner'>('builder');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Lifted state to share between Builder and Scanner
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    experience: [],
    education: []
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <FileText className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">ResuMatch<span className="text-blue-600">.AI</span></span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'builder' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Resume Builder
              </button>
              <button
                onClick={() => setActiveTab('scanner')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'scanner' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                ATS Scanner
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <button
                onClick={() => { setActiveTab('builder'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === 'builder' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
                }`}
              >
                Resume Builder
              </button>
              <button
                onClick={() => { setActiveTab('scanner'); setIsMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === 'scanner' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
                }`}
              >
                ATS Scanner
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' ? (
           <div className="h-[calc(100vh-8rem)]">
              <ResumeBuilder 
                initialData={resumeData} 
                onUpdate={setResumeData} 
              />
           </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Scanner</h1>
              <p className="text-slate-600">Optimize your resume for specific job descriptions using Gemini AI.</p>
            </div>
            <ATSScanner currentResumeData={resumeData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
