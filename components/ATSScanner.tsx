import React, { useState } from 'react';
import { analyzeResume } from '../services/geminiService';
import { AnalysisResult, ResumeData } from '../types';
import { AlertCircle, CheckCircle, Upload, Search, FileText } from './ui/Icons';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ATSScannerProps {
  currentResumeData: ResumeData;
}

const ATSScanner: React.FC<ATSScannerProps> = ({ currentResumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  // Convert current resume data to a readable string format for the AI
  const formatResumeForAI = (data: ResumeData) => {
    let text = `Name: ${data.fullName}\nSummary: ${data.summary}\nSkills: ${data.skills}\nExperience:\n`;
    data.experience.forEach(exp => {
      text += `${exp.role} at ${exp.company} (${exp.startDate}-${exp.endDate}): ${exp.description}\n`;
    });
    return text;
  };

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a Job Description.");
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const resumeText = formatResumeForAI(currentResumeData);
      const analysis = await analyzeResume(resumeText, jobDescription);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Search className="text-blue-600" />
          ATS Scanner
        </h2>
        <p className="text-slate-600 mb-6">
          Paste the job description below. We will analyze your current resume (from the Builder tab) against it.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
            <textarea
              className="w-full h-48 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end pt-2">
             <button
              onClick={handleScan}
              disabled={loading || !currentResumeData.fullName}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Scan Resume
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Score Card */}
          <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Match Score</h3>
            <div className="relative w-48 h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        innerRadius="80%" 
                        outerRadius="100%" 
                        barSize={10} 
                        data={[{ name: 'Score', value: result.score, fill: getScoreColor(result.score) }]} 
                        startAngle={90} 
                        endAngle={-270}
                    >
                        <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold" style={{ color: getScoreColor(result.score) }}>{result.score}%</span>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Match</span>
                </div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-4 px-4">{result.matchSummary}</p>
          </div>

          {/* Radar Chart Analysis */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-700 mb-4">Detailed Breakdown</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.skillGapAnalysis}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skill Match"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                    />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Missing Keywords */}
          <div className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0 ? (
                result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100 font-medium">
                    {kw}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 italic">No critical keywords missing!</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              AI Recommendations
            </h3>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSScanner;
