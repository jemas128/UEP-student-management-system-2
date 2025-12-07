import { GoogleGenAI } from "@google/genai";
import { User, Grade, Subject } from "../types";

const initAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeStudentPerformance = async (
  student: User,
  grades: Grade[],
  subjects: Subject[]
): Promise<string> => {
  const ai = initAI();
  if (!ai) return "Gemini API Key is missing. Please configure the environment.";

  // Prepare data context
  const transcript = grades.map(g => {
    const subject = subjects.find(s => s.id === g.subjectId);
    return `- ${subject?.name} (${subject?.code}): ${g.score}`;
  }).join("\n");

  const prompt = `
    You are an academic advisor at a prestigious university.
    Analyze the following student's performance and provide a constructive summary, highlighting strengths, weaknesses, and recommendations.
    Student Name: ${student.fullName}
    
    Grades:
    ${transcript}

    Please keep the response under 150 words, professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate analysis. Please try again later.";
  }
};
