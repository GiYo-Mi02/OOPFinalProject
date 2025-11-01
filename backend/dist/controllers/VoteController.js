"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteController = void 0;
const zod_1 = require("zod");
const VoteService_1 = require("../services/VoteService");
class VoteController {
    constructor(service = new VoteService_1.VoteService()) {
        this.service = service;
        this.getLeaderboard = async (req, res, next) => {
            try {
                const { instituteId } = this.parseParams(req.params);
                const leaderboard = await this.service.getLeaderboard(instituteId);
                res.status(200).json({ instituteId, leaderboard });
            }
            catch (error) {
                next(error);
            }
        };
    }
    parseParams(params) {
        return zod_1.z
            .object({
            instituteId: zod_1.z.string().min(1),
        })
            .parse(params);
    }
}
exports.VoteController = VoteController;
