export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  graduationDate: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string; // Comma separated
  experience: Experience[];
  education: Education[];
}

export interface AnalysisResult {
  score: number;
  matchSummary: string;
  missingKeywords: string[];
  suggestions: string[];
  skillGapAnalysis: {
    category: string;
    score: number;
  }[];
}
