import mammoth from "mammoth";

export class DocxLoader {
  async loadFromBuffer(buffer: ArrayBuffer): Promise<string> {
    try {
      console.log("inside mammoth");
      let result;
      if (typeof Buffer !== "undefined" && buffer instanceof ArrayBuffer) {
        const nodeBuffer = Buffer.from(buffer);
        result = await mammoth.extractRawText({ buffer: nodeBuffer });
      } else {
        // Browser: use ArrayBuffer directly
        result = await mammoth.extractRawText({ arrayBuffer: buffer });
      }
      return result.value; // This is the extracted plain text
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }
}
