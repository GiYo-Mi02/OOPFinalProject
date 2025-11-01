import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.warn("⚠️  Email service not configured. Set SMTP_* environment variables.");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      console.log("✅ Email service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
    }
  }

  async sendEmail(payload: EmailPayload): Promise<{ id: string; success: boolean }> {
    if (!this.transporter) {
      console.warn("⚠️  Email not sent (transporter not configured):", payload.to);
      return { id: `email_${Date.now()}`, success: false };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"UMak eBallot" <noreply@umak.edu.ph>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      return { id: info.messageId, success: true };
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async sendOTP(email: string, otp: string, expiresIn: number): Promise<{ success: boolean }> {
    const expiryMinutes = Math.floor(expiresIn / 60);
    
    const html = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UMak eBallot OTP</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f2f3f8;
      margin: 0;
      padding: 24px;
      color: #2d2d2d;
    }

    .email-container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .header {
      background-color: #304ffe;
      text-align: center;
      padding: 36px 28px;
      color: #fff;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .content {
      padding: 36px 28px;
      font-size: 15px;
      line-height: 1.6;
      color: #333;
    }

    .otp-box {
      background: #f4f6ff;
      color: #304ffe;
      font-size: 34px;
      font-weight: 700;
      text-align: center;
      padding: 18px;
      border-radius: 10px;
      letter-spacing: 8px;
      margin: 28px 0;
      font-family: 'Courier New', monospace;
    }

    .info {
      background: #f9fafc;
      border-left: 4px solid #304ffe;
      padding: 14px 18px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 14px;
    }

    .warning {
      color: #b91c1c;
      font-size: 14px;
      margin-top: 24px;
      font-weight: 500;
    }

    .footer {
      background: #fafafa;
      text-align: center;
      padding: 18px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      .content, .header {
        padding: 24px 20px;
      }
      .otp-box {
        font-size: 28px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>UMak eBallot</h1>
      <p>One-Time Password Verification</p>
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>Use the code below to securely sign in to your <strong>UMak eBallot</strong> account:</p>

      <div class="otp-box">${otp}</div>

      <div class="info">
        <p><strong>This code expires in ${expiryMinutes} minutes.</strong></p>
        <p style="margin:6px 0 0;">Please enter it on the verification screen to continue.</p>
      </div>

      <p class="warning">
        If you didn’t request this code, please ignore this email. Someone may have entered your address by mistake.
      </p>

      <p style="margin-top: 28px; color: #666; font-size: 14px;">
        For security reasons, never share this code with anyone. UMak eBallot staff will never ask for it.
      </p>
    </div>

    <div class="footer">
      <p><strong>UMak eBallot</strong> — University of Makati</p>
      <p>This is an automated message. Please don’t reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.sendEmail({
      to: email,
      subject: "Your UMak eBallot Verification Code",
      html,
    });

    return { success: result.success };
  }
}
