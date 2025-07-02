export interface AnalysisRequest {
  jobDescription: string;
  cv: string;
}

export interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  alignment: number;
  recommendations: string[];
  summary: string;
}
