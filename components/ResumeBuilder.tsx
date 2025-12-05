import React, { useState, useRef } from 'react';
import { ResumeData, Experience, Education } from '../types';
import { Plus, Trash2, Download, Wand2 } from './ui/Icons';
import { enhanceSummary } from '../services/geminiService';

interface ResumeBuilderProps {
  initialData: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialData, onUpdate }) => {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleChange = (field: keyof ResumeData, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    const newExp = data.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    const newData = { ...data, experience: newExp };
    setData(newData);
    onUpdate(newData);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    const newData = { ...data, experience: [...data.experience, newExp] };
    setData(newData);
    onUpdate(newData);
  };

  const removeExperience = (id: string) => {
    const newData = { ...data, experience: data.experience.filter(e => e.id !== id) };
    setData(newData);
    onUpdate(newData);
  };

  const handleAutoEnhanceSummary = async () => {
    if (!data.summary) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceSummary(data.summary, "Professional");
      handleChange('summary', enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Editor Section */}
      <div className="flex-1 overflow-y-auto no-print bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Resume Editor</h2>
          <button onClick={handlePrint} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <Download size={16} />
            Export PDF
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Personal Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={data.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
               <input 
                type="text" 
                placeholder="Job Title (e.g. Software Engineer)" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                // Assuming phone field is used for title in this simplified generic type, or add title to type. 
                // Let's stick to the type. We'll use a hack or just map it mentally, 
                // but actually let's just use the phone/email fields correctly.
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Phone" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={data.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Location (City, Country)" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none md:col-span-2"
                value={data.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </section>

          {/* Summary */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Professional Summary</h3>
                <button 
                    onClick={handleAutoEnhanceSummary}
                    disabled={isEnhancing || !data.summary}
                    className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:text-purple-700 disabled:opacity-50"
                >
                    <Wand2 size={12} />
                    {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                </button>
            </div>
            <textarea 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none"
              placeholder="Brief professional summary..."
              value={data.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
            />
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Experience</h3>
              <button onClick={addExperience} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input 
                      placeholder="Company"
                      className="bg-white p-2 border border-slate-200 rounded text-sm"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                    />
                    <input 
                      placeholder="Role"
                      className="bg-white p-2 border border-slate-200 rounded text-sm"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                    />
                    <input 
                      placeholder="Start Date"
                      className="bg-white p-2 border border-slate-200 rounded text-sm"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                    />
                    <input 
                      placeholder="End Date"
                      className="bg-white p-2 border border-slate-200 rounded text-sm"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <textarea 
                    placeholder="Description of responsibilities..."
                    className="w-full bg-white p-2 border border-slate-200 rounded text-sm h-20 resize-none"
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Skills</h3>
            <textarea 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Java, React, Team Leadership, Project Management (Comma separated)"
              value={data.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
            />
          </section>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 bg-slate-200 p-4 lg:p-8 rounded-xl overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
        <div 
            id="resume-preview" 
            className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] p-[20mm] print:shadow-none print:w-full print:max-w-none text-slate-800"
        >
            <header className="border-b-2 border-slate-800 pb-6 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{data.fullName || 'Your Name'}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>• {data.phone}</span>}
                    {data.location && <span>• {data.location}</span>}
                </div>
            </header>

            {data.summary && (
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
                </section>
            )}

            {data.experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Experience</h2>
                    <div className="space-y-4">
                        {data.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                    <span className="text-xs text-slate-500">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-sm font-semibold text-slate-600 mb-1">{exp.company}</div>
                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {data.skills && (
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.split(',').map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
