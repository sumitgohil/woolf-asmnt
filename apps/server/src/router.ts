import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };
  }),

  analyze: publicProcedure
    .input(z.object({
      jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
      cv: z.string().min(10, "CV must be at least 10 characters"),
    }))
    .mutation(async ({ input }) => {
      try {
        if (!input.jobDescription.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Job description cannot be empty"
          });
        }

        if (!input.cv.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST", 
            message: "CV cannot be empty"
          });
        }

        // Mock processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          data: {
            strengths: [
              "Good technical background",
              "Relevant experience mentioned",
              "Clear communication skills"
            ],
            weaknesses: [
              "Could use more specific examples",
              "Missing some key skills from job description"
            ],
            alignment: Math.floor(Math.random() * 40) + 60,
            recommendations: [
              "Add more quantifiable achievements",
              "Highlight relevant project experience",
              "Consider adding missing technical skills"
            ],
            summary: "Candidate shows promise with room for improvement in key areas"
          },
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error("Analysis error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze CV. Please try again."
        });
      }
    }),
});

export type AppRouter = typeof appRouter;
