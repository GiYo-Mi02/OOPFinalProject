import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "../services/AuthService";

export class AuthController {
  constructor(private readonly service = new AuthService()) {}

  requestOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = this.parseEmailBody(req.body);
      const result = await this.service.requestOtp(email);
      res.status(200).json({ message: "OTP issued", meta: result });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = this.parseVerifyBody(req.body);
      const result = await this.service.verifyOtp(email, otp);
      res.status(200).json({ message: "OTP verified", ...result });
    } catch (error) {
      next(error);
    }
  };

  private parseEmailBody(body: unknown) {
    return z
      .object({
        email: z.string().email(),
      })
      .parse(body);
  }

  private parseVerifyBody(body: unknown) {
    return z
      .object({
        email: z.string().email(),
        otp: z.string().length(6),
      })
      .parse(body);
  }
}
