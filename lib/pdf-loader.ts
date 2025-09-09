import pdfParse from "pdf-parse";

export class PDFLoader {
  /**
   * @param buffer ArrayBuffer of PDF file
   * @returns the full text content
   */
  async loadFromBuffer(buffer: ArrayBuffer): Promise<string> {
    try {
      // Convert ArrayBuffer to Node Buffer
      const nodeBuffer = Buffer.from(buffer);

      // Parse PDF to get text
      const data = await pdfParse(nodeBuffer);
      return data.text; // All extracted text, pages concatenated
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to parse PDF file");
    }
  }
}
