"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const AuthService_1 = require("../services/AuthService");
class AuthController {
    constructor(service = new AuthService_1.AuthService()) {
        this.service = service;
        this.requestOtp = async (req, res, next) => {
            try {
                const { email } = this.parseEmailBody(req.body);
                const result = await this.service.requestOtp(email);
                res.status(200).json({ message: "OTP issued", meta: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyOtp = async (req, res, next) => {
            try {
                const { email, otp } = this.parseVerifyBody(req.body);
                const result = await this.service.verifyOtp(email, otp);
                res.status(200).json({ message: "OTP verified", ...result });
            }
            catch (error) {
                next(error);
            }
        };
    }
    parseEmailBody(body) {
        return zod_1.z
            .object({
            email: zod_1.z.string().email(),
        })
            .parse(body);
    }
    parseVerifyBody(body) {
        return zod_1.z
            .object({
            email: zod_1.z.string().email(),
            otp: zod_1.z.string().length(6),
        })
            .parse(body);
    }
}
exports.AuthController = AuthController;
