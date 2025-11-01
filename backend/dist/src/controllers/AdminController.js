"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const zod_1 = require("zod");
const AdminService_1 = require("../services/AdminService");
class AdminController {
    constructor(service = new AdminService_1.AdminService()) {
        this.service = service;
        // Elections
        this.getElections = async (req, res, next) => {
            try {
                const elections = await this.service.getElections();
                res.status(200).json({ elections });
            }
            catch (error) {
                next(error);
            }
        };
        this.createElection = async (req, res, next) => {
            try {
                const payload = this.parseElectionBody(req.body);
                const election = await this.service.createElection(payload);
                res.status(201).json({ message: "Election created", election });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateElection = async (req, res, next) => {
            try {
                const { id } = this.parseIdParams(req.params);
                const payload = this.parseElectionBody(req.body);
                const election = await this.service.updateElection(id, payload);
                res.status(200).json({ message: "Election updated", election });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteElection = async (req, res, next) => {
            try {
                const { id } = this.parseIdParams(req.params);
                await this.service.deleteElection(id);
                res.status(200).json({ message: "Election deleted" });
            }
            catch (error) {
                next(error);
            }
        };
        // Candidates
        this.getCandidates = async (req, res, next) => {
            try {
                const candidates = await this.service.getCandidates();
                res.status(200).json({ candidates });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPositionsByElection = async (req, res, next) => {
            try {
                const { electionId } = zod_1.z.object({ electionId: zod_1.z.string().uuid() }).parse(req.params);
                const positions = await this.service.getPositionsByElection(electionId);
                res.status(200).json({ positions });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPosition = async (req, res, next) => {
            try {
                const payload = zod_1.z.object({
                    election_id: zod_1.z.string().uuid(),
                    title: zod_1.z.string().min(1),
                    display_order: zod_1.z.number().optional(),
                }).parse(req.body);
                const position = await this.service.createPosition(payload);
                res.status(201).json({ message: "Position created", position });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCandidate = async (req, res, next) => {
            try {
                const payload = this.parseCandidateBody(req.body);
                const candidate = await this.service.createCandidate(payload);
                res.status(201).json({ message: "Candidate created", candidate });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCandidate = async (req, res, next) => {
            try {
                const { id } = this.parseIdParams(req.params);
                const payload = this.parseCandidateBody(req.body);
                const candidate = await this.service.updateCandidate(id, payload);
                res.status(200).json({ message: "Candidate updated", candidate });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCandidate = async (req, res, next) => {
            try {
                const { id } = this.parseIdParams(req.params);
                await this.service.deleteCandidate(id);
                res.status(200).json({ message: "Candidate deleted" });
            }
            catch (error) {
                next(error);
            }
        };
        // Analytics
        this.getAnalytics = async (req, res, next) => {
            try {
                const analytics = await this.service.getAnalytics();
                res.status(200).json(analytics);
            }
            catch (error) {
                next(error);
            }
        };
    }
    // Validation helpers
    parseIdParams(params) {
        return zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(params);
    }
    parseElectionBody(body) {
        return zod_1.z
            .object({
            title: zod_1.z.string().min(1),
            description: zod_1.z.string().optional(),
            institute_id: zod_1.z.string().min(1),
            start_date: zod_1.z.string().transform((value) => new Date(value)),
            end_date: zod_1.z.string().transform((value) => new Date(value)),
            status: zod_1.z.enum(["upcoming", "active", "completed"]).optional(),
        })
            .parse(body);
    }
    parseCandidateBody(body) {
        return zod_1.z
            .object({
            name: zod_1.z.string().min(1),
            position_id: zod_1.z.string().uuid(),
            college: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            past_leadership: zod_1.z.string().optional(),
            grades: zod_1.z.string().optional(),
            qualifications: zod_1.z.string().optional(),
            image_url: zod_1.z.string().url().optional(),
            platform: zod_1.z.string().optional(),
        })
            .parse(body);
    }
}
exports.AdminController = AdminController;
