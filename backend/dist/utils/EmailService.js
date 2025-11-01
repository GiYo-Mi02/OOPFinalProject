"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
class EmailService {
    async sendEmail(payload) {
        // TODO: wire an actual email provider (e.g., Resend, SendGrid).
        console.info("Email queued", payload);
        return { id: `email_${Date.now()}` };
    }
}
exports.EmailService = EmailService;
