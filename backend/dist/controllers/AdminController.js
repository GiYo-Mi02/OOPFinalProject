"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const zod_1 = require("zod");
const AdminService_1 = require("../services/AdminService");
class AdminController {
    constructor(service = new AdminService_1.AdminService()) {
        this.service = service;
        this.createElection = async (req, res, next) => {
            try {
                const payload = this.parseBody(req.body);
                const election = await this.service.publishElection(payload);
                res.status(201).json({ message: "Election created", election });
            }
            catch (error) {
                next(error);
            }
        };
    }
    parseBody(body) {
        return zod_1.z
            .object({
            name: zod_1.z.string().min(1),
            instituteId: zod_1.z.string().min(1),
            startsAt: zod_1.z.string().transform((value) => new Date(value)),
            endsAt: zod_1.z.string().transform((value) => new Date(value)),
        })
            .parse(body);
    }
}
exports.AdminController = AdminController;
