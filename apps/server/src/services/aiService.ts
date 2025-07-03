import axios, { AxiosResponse } from "axios";
import { AI_CONFIG, ANALYSIS_PROMPTS } from "../config/ai";

export interface GenerateContentRequest {
  contents: Array<{
    role: "user" | "model";
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
  };
}

export interface GenerateContentResponse {
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  alignment: number;
  recommendations: string[];
  summary: string;
}

export class AIService {
  private static requestCount = 0;
  private static lastResetTime = Date.now();

  static async analyzeCVMatch(
    jobDescription: string,
    cv: string
  ): Promise<AnalysisResult> {
    await this.checkRateLimit();
    console.log("AI_CONFIG", process.env.AUTHORIZATION_TOKEN);
    console.log("AI_CONFIG.AUTHORIZATION_TOKEN", AI_CONFIG.AUTHORIZATION_TOKEN);
    const apiKey = AI_CONFIG.AUTHORIZATION_TOKEN;
    if (!apiKey) {
      throw new Error(
        "AUTHORIZATION_TOKEN not configured. Please set it in your .env file."
      );
    }

    const prompt = ANALYSIS_PROMPTS.USER_TEMPLATE.replace(
      "{jobDescription}",
      jobDescription
    ).replace("{cv}", cv);

    const request: GenerateContentRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: ANALYSIS_PROMPTS.SYSTEM + "\n\n" + prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        candidateCount: 1,
      },
    };

    try {
      const response = await this.callVertexAI(request);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error("AI analysis error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            "Authentication failed. Please check your AUTHORIZATION_TOKEN."
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            "Permission denied. Please verify your API key permissions."
          );
        }
        if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
      }

      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private static async callVertexAI(
    request: GenerateContentRequest
  ): Promise<GenerateContentResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= AI_CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`AI API attempt ${attempt}/${AI_CONFIG.MAX_RETRIES}`);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: AI_CONFIG.AUTHORIZATION_TOKEN,
        };

        const response: AxiosResponse<GenerateContentResponse> =
          await axios.post(AI_CONFIG.GEMINI_ENDPOINT, request, {
            headers,
            timeout: AI_CONFIG.TIMEOUT,
          });

        this.requestCount++;
        console.log("AI API call successful");
        return response.data;
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error("Unknown API error");
        console.error(`AI API attempt ${attempt} failed:`, {
          message: lastError.message,
          status: axios.isAxiosError(error)
            ? error.response?.status
            : "unknown",
        });

        if (attempt < AI_CONFIG.MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("All AI API attempts failed");
  }

  private static parseAnalysisResponse(
    response: GenerateContentResponse
  ): AnalysisResult {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response from AI service");
    }

    const candidate = response.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("Invalid response structure from AI service");
    }

    const textResponse = candidate.content.parts[0].text;

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textResponse;

      const parsed = JSON.parse(jsonText);

      if (
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.weaknesses) ||
        !Array.isArray(parsed.recommendations) ||
        typeof parsed.alignment !== "number" ||
        typeof parsed.summary !== "string"
      ) {
        throw new Error("Invalid analysis format from AI service");
      }

      parsed.alignment = Math.max(0, Math.min(100, parsed.alignment));

      return parsed as AnalysisResult;
    } catch (error) {
      console.error("Failed to parse AI response:", textResponse);

      return {
        strengths: ["Unable to parse AI response - technical skills noted"],
        weaknesses: ["AI response parsing failed - manual review needed"],
        alignment: 50,
        recommendations: ["Please review manually due to AI parsing error"],
        summary: "AI analysis completed but response parsing failed",
      };
    }
  }

  private static async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    if (timeSinceReset > 60 * 60 * 1000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= AI_CONFIG.RATE_LIMIT.REQUESTS_PER_HOUR) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
  }
}
