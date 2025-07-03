import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { AIService } from "./services/aiService";
import { PDFService } from "./services/pdfService";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }),

  checkAI: publicProcedure.query(() => {
    return {
      status: "AI service ready",
      endpoint: process.env.GEMINI_ENDPOINT ? "configured" : "not configured",
      authToken: process.env.AUTHORIZATION_TOKEN
        ? "configured"
        : "not configured",
      timestamp: new Date().toISOString(),
    };
  }),

  analyzeText: publicProcedure
    .input(
      z.object({
        jobDescription: z
          .string()
          .min(10, "Job description must be at least 10 characters"),
        cv: z.string().min(10, "CV must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await AIService.analyzeCVMatch(
          input.jobDescription,
          input.cv
        );

        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Analysis failed",
        });
      }
    }),

  analyzePDFs: publicProcedure
    .input(
      z.object({
        jobDescriptionBase64: z
          .string()
          .min(1, "Job description PDF is required"),
        cvBase64: z.string().min(1, "CV PDF is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const jobDescriptionBuffer = Buffer.from(
          input.jobDescriptionBase64,
          "base64"
        );
        const cvBuffer = Buffer.from(input.cvBase64, "base64");

        console.log("Extracting text from job description PDF...");
        const jobDescriptionText =
          await PDFService.extractText(jobDescriptionBuffer);

        console.log("Extracting text from CV PDF...");
        const cvText = await PDFService.extractText(cvBuffer);

        if (jobDescriptionText.length < 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Job description PDF contains insufficient text content",
          });
        }
        if (cvText.length < 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CV PDF contains insufficient text content",
          });
        }

        console.log("Analyzing with AI...");
        const result = await AIService.analyzeCVMatch(
          jobDescriptionText,
          cvText
        );

        return {
          success: true,
          data: {
            ...result,
            metadata: {
              jobDescriptionLength: jobDescriptionText.length,
              cvLength: cvText.length,
              extractedAt: new Date().toISOString(),
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("PDF analysis error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "PDF analysis failed",
        });
      }
    }),

  // Legacy analyze endpoint for backward compatibility
  analyze: publicProcedure
    .input(
      z.object({
        jobDescription: z
          .string()
          .min(10, "Job description must be at least 10 characters"),
        cv: z.string().min(10, "CV must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await AIService.analyzeCVMatch(
          input.jobDescription,
          input.cv
        );
        return result;
      } catch (error) {
        // Fallback to mock data if AI fails
        return {
          strengths: ["Good technical background", "Relevant experience"],
          weaknesses: ["Could use more specific examples"],
          alignment: 75,
          recommendations: ["Add more quantifiable achievements"],
          summary: "Candidate shows promise with room for improvement",
        };
      }
    }),
});

export type AppRouter = typeof appRouter;
