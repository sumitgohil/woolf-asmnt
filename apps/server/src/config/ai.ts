export const AI_CONFIG = {
  GEMINI_ENDPOINT: process.env.GEMINI_ENDPOINT || "https://intertest.woolf.engineering/invoke",
  AUTHORIZATION_TOKEN: process.env.AUTHORIZATION_TOKEN || "",
  MAX_RETRIES: 3,
  TIMEOUT: 30000,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 20,
    REQUESTS_PER_HOUR: 300,
  },
};

export const ANALYSIS_PROMPTS = {
  SYSTEM: `You are an expert HR analyst. Analyze the candidate's CV against the job description and provide detailed feedback.

Return your analysis in this JSON format:
{
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "alignment": number (0-100),
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "summary": "brief overall assessment"
}`,

  USER_TEMPLATE: `Please analyze this candidate's CV against the job description:

JOB DESCRIPTION:
{jobDescription}

CANDIDATE CV:
{cv}

Focus on technical skills alignment, experience relevance, and overall suitability. Return only valid JSON.`,
};
