"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExporter = void 0;
const stream_1 = require("stream");
class FileExporter {
    async exportToCsv(rows) {
        // TODO: replace with real CSV serialization.
        const headers = Object.keys(rows[0] ?? {}).join(",");
        const body = rows.map((row) => Object.values(row).join(",")).join("\n");
        return Buffer.from(`${headers}\n${body}`);
    }
    async exportToPdf(_) {
        // TODO: integrate with a proper PDF generator (e.g. PDFKit).
        return Buffer.from("PDF export is not yet implemented.");
    }
    streamBuffer(buffer) {
        const stream = new stream_1.Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }
}
exports.FileExporter = FileExporter;
