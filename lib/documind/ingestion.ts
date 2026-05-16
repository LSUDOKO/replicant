import type { DocumentContent, DocumentType } from "./types";

export class IngestionService {
  async parseText(text: string, filename: string, fileType: DocumentType): Promise<DocumentContent> {
    return {
      filename,
      fileType,
      rawText: text,
      metadata: {},
    };
  }

  async parseFile(buffer: Buffer, filename: string): Promise<DocumentContent> {
    const extension = filename.split(".").pop()?.toLowerCase() as DocumentType;

    if (extension === "pdf") {
      return this.parsePDF(buffer, filename);
    } else if (extension === "docx") {
      return this.parseDOCX(buffer, filename);
    }
    return this.parseTXT(buffer, filename);
  }

  private async parsePDF(buffer: Buffer, filename: string): Promise<DocumentContent> {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo(),
      ]);
      await parser.destroy();
      return {
        filename,
        fileType: "pdf",
        rawText: textResult.text,
        pages: textResult.total,
        metadata: {
          author: infoResult.info?.Author,
          created: infoResult.getDateNode().CreationDate ?? undefined,
        },
      };
    } catch {
      return {
        filename,
        fileType: "pdf",
        rawText: buffer.toString("utf-8"),
        metadata: {},
      };
    }
  }

  private async parseDOCX(buffer: Buffer, filename: string): Promise<DocumentContent> {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return {
        filename,
        fileType: "docx",
        rawText: result.value,
        metadata: {},
      };
    } catch {
      return {
        filename,
        fileType: "docx",
        rawText: buffer.toString("utf-8"),
        metadata: {},
      };
    }
  }

  private async parseTXT(buffer: Buffer, filename: string): Promise<DocumentContent> {
    return {
      filename,
      fileType: "txt",
      rawText: buffer.toString("utf-8"),
      metadata: {},
    };
  }

  estimateLineNumber(fullText: string, snippet: string): number {
    const index = fullText.indexOf(snippet);
    if (index === -1) return 0;
    return fullText.substring(0, index).split("\n").length;
  }
}
