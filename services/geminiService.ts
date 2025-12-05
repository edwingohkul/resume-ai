import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeResume = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are an expert Applicant Tracking System (ATS) and Career Coach. 
    Analyze the following Resume text against the Job Description.
    
    RESUME:
    ${resumeText}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Provide a detailed analysis in strict JSON format.
    1. Calculate a match score (0-100).
    2. Provide a brief summary of the fit.
    3. List critical missing keywords found in the JD but not the resume.
    4. Provide specific, actionable suggestions to improve the resume for this role.
    5. Analyze skill gaps in 5 categories: 'Technical', 'Soft Skills', 'Experience', 'Education', 'Domain Knowledge' with a score of 1-100 for each.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Overall match score from 0 to 100" },
            matchSummary: { type: Type.STRING, description: "2-3 sentences summarizing the fit" },
            missingKeywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of important keywords missing from the resume"
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of actionable improvements"
            },
            skillGapAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const enhanceSummary = async (currentSummary: string, jobTitle: string): Promise<string> => {
    if (!apiKey) return "API Key missing";

    const prompt = `Rewrite the following professional summary to be more impactful, concise, and result-oriented for a ${jobTitle} role. Keep it under 50 words.\n\nCurrent Summary: ${currentSummary}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text || currentSummary;
}
