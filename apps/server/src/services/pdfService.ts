import pdf from "pdf-parse";

export class PDFService {
  static async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error(
          "PDF appears to be empty or contains no extractable text"
        );
      }

      return this.cleanText(data.text);
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s\-.,!?@()]/g, "")
      .trim();
  }

  static validatePDF(file: Express.Multer.File): void {
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.mimetype !== "application/pdf") {
      throw new Error("File must be a PDF");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("PDF file too large. Maximum size is 10MB");
    }

    if (file.size === 0) {
      throw new Error("PDF file is empty");
    }
  }
}
