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
        this.castVote = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({ error: "User not authenticated" });
                }
                const voteData = this.parseVoteBody(req.body);
                const result = await this.service.castVote(userId, voteData);
                res.status(201).json({ success: true, ...result });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkVoteStatus = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({ error: "User not authenticated" });
                }
                const { electionId } = this.parseElectionParams(req.params);
                const hasVoted = await this.service.checkIfUserVoted(userId, electionId);
                res.status(200).json({ hasVoted });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActiveElections = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({ error: "User not authenticated" });
                }
                const instituteId = req.user?.instituteId;
                const elections = await this.service.getActiveElections(instituteId);
                res.status(200).json({ elections });
            }
            catch (error) {
                next(error);
            }
        };
        this.getElectionCandidates = async (req, res, next) => {
            try {
                const { electionId } = this.parseElectionParams(req.params);
                const candidates = await this.service.getElectionCandidates(electionId);
                res.status(200).json({ candidates });
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
    parseElectionParams(params) {
        return zod_1.z
            .object({
            electionId: zod_1.z.string().uuid(),
        })
            .parse(params);
    }
    parseVoteBody(body) {
        return zod_1.z
            .object({
            electionId: zod_1.z.string().uuid(),
            votes: zod_1.z.array(zod_1.z.object({
                positionId: zod_1.z.string().uuid(),
                candidateId: zod_1.z.string().uuid().or(zod_1.z.literal("abstain")),
            })),
        })
            .parse(body);
    }
}
exports.VoteController = VoteController;
