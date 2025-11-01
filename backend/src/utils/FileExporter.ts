import { Readable } from "stream";

export class FileExporter {
  async exportToCsv<T extends Record<string, unknown>>(rows: T[]) {
    // TODO: replace with real CSV serialization.
    const headers = Object.keys(rows[0] ?? {}).join(",");
    const body = rows.map((row) => Object.values(row).join(",")).join("\n");
    return Buffer.from(`${headers}\n${body}`);
  }

  async exportToPdf(_: unknown[]) {
    // TODO: integrate with a proper PDF generator (e.g. PDFKit).
    return Buffer.from("PDF export is not yet implemented.");
  }

  streamBuffer(buffer: Buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
