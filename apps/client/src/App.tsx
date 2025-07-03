import React, { useState } from "react";
import {
  Upload,
  FileText,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { trpc } from "./utils/trpc";

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  alignment: number;
  recommendations: string[];
  summary: string;
  metadata?: {
    jobDescriptionLength: number;
    cvLength: number;
    extractedAt: string;
  };
}

function App() {
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMutation = trpc.analyzePDFs.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setAnalysisResult(data.data);
      }
      setIsAnalyzing(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsAnalyzing(false);
    },
  });

  const handleFileUpload = (file: File, type: "jobDescription" | "cv") => {
    if (file.type !== "application/pdf") {
      setError("Please upload PDF files only");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB");
      return;
    }

    if (type === "jobDescription") {
      setJobDescriptionFile(file);
    } else {
      setCvFile(file);
    }
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!jobDescriptionFile || !cvFile) {
      setError("Please upload both job description and CV files");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const jobDescriptionBase64 = await fileToBase64(jobDescriptionFile);
      const cvBase64 = await fileToBase64(cvFile);

      analyzeMutation.mutate({
        jobDescriptionBase64,
        cvBase64,
      });
    } catch (error) {
      setError("Failed to process files");
      setIsAnalyzing(false);
    }
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 80) return "text-green-600";
    if (alignment >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlignmentBg = (alignment: number) => {
    if (alignment >= 80) return "bg-green-100 border-green-200";
    if (alignment >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Brain className="mr-3 text-blue-600" />
            CV Analysis Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a job description and CV to get AI-powered analysis and
            recommendations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Upload className="mr-2 text-blue-600" />
            Upload Documents
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (PDF)
              </label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "jobDescription");
                  }}
                  className="hidden"
                  id="job-description-upload"
                />
                <label
                  htmlFor="job-description-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {jobDescriptionFile
                      ? `✓ ${jobDescriptionFile.name}`
                      : "Click to upload job description"}
                  </span>
                  {jobDescriptionFile && (
                    <span className="text-xs text-gray-500 mt-1">
                      {(jobDescriptionFile.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV/Resume (PDF)
              </label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "cv");
                  }}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {cvFile ? `✓ ${cvFile.name}` : "Click to upload CV/Resume"}
                  </span>
                  {cvFile && (
                    <span className="text-xs text-gray-500 mt-1">
                      {(cvFile.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={!jobDescriptionFile || !cvFile || isAnalyzing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="loading-spinner mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2" />
                  Analyze CV
                </>
              )}
            </button>
          </div>
        </div>

        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <CheckCircle className="mr-2 text-green-600" />
              Analysis Results
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Overall Alignment</h3>
                <span
                  className={`text-2xl font-bold ${getAlignmentColor(
                    analysisResult.alignment
                  )}`}
                >
                  {analysisResult.alignment}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    analysisResult.alignment >= 80
                      ? "bg-green-600"
                      : analysisResult.alignment >= 60
                        ? "bg-yellow-600"
                        : "bg-red-600"
                  }`}
                  style={{ width: `${analysisResult.alignment}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-3">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-red-700 mb-3">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-blue-700 mb-3">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`p-4 rounded-lg border ${getAlignmentBg(
                analysisResult.alignment
              )}`}
            >
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-sm">{analysisResult.summary}</p>

              {analysisResult.metadata && (
                <div className="mt-3 text-xs text-gray-600">
                  <p>
                    Processed {analysisResult.metadata.jobDescriptionLength}{" "}
                    characters from job description,{" "}
                    {analysisResult.metadata.cvLength} characters from CV
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
