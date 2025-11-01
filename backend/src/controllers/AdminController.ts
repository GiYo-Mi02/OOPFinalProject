import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AdminService } from "../services/AdminService";

export class AdminController {
  constructor(private readonly service = new AdminService()) {}

  // Elections
  getElections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const elections = await this.service.getElections();
      res.status(200).json({ elections });
    } catch (error) {
      next(error);
    }
  };

  createElection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = this.parseElectionBody(req.body);
      const election = await this.service.createElection(payload);
      res.status(201).json({ message: "Election created", election });
    } catch (error) {
      next(error);
    }
  };

  updateElection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = this.parseIdParams(req.params);
      const payload = this.parseElectionBody(req.body);
      const election = await this.service.updateElection(id, payload);
      res.status(200).json({ message: "Election updated", election });
    } catch (error) {
      next(error);
    }
  };

  deleteElection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = this.parseIdParams(req.params);
      await this.service.deleteElection(id);
      res.status(200).json({ message: "Election deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Candidates
  getCandidates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidates = await this.service.getCandidates();
      res.status(200).json({ candidates });
    } catch (error) {
      next(error);
    }
  };

  getPositionsByElection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { electionId } = z.object({ electionId: z.string().uuid() }).parse(req.params);
      const positions = await this.service.getPositionsByElection(electionId);
      res.status(200).json({ positions });
    } catch (error) {
      next(error);
    }
  };

  createPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = z.object({
        election_id: z.string().uuid(),
        title: z.string().min(1),
        display_order: z.number().optional(),
      }).parse(req.body);
      
      const position = await this.service.createPosition(payload);
      res.status(201).json({ message: "Position created", position });
    } catch (error) {
      next(error);
    }
  };

  createCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = this.parseCandidateBody(req.body);
      const candidate = await this.service.createCandidate(payload);
      res.status(201).json({ message: "Candidate created", candidate });
    } catch (error) {
      next(error);
    }
  };

  updateCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = this.parseIdParams(req.params);
      const payload = this.parseCandidateBody(req.body);
      const candidate = await this.service.updateCandidate(id, payload);
      res.status(200).json({ message: "Candidate updated", candidate });
    } catch (error) {
      next(error);
    }
  };

  deleteCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = this.parseIdParams(req.params);
      await this.service.deleteCandidate(id);
      res.status(200).json({ message: "Candidate deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Analytics
  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.service.getAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  };

  // Validation helpers
  private parseIdParams(params: unknown) {
    return z.object({ id: z.string().uuid() }).parse(params);
  }

  private parseElectionBody(body: unknown) {
    return z
      .object({
        title: z.string().min(1),
        description: z.string().optional(),
        institute_id: z.string().min(1),
        start_date: z.string().transform((value) => new Date(value)),
        end_date: z.string().transform((value) => new Date(value)),
        status: z.enum(["upcoming", "active", "completed"]).optional(),
      })
      .parse(body);
  }

  private parseCandidateBody(body: unknown) {
    return z
      .object({
        name: z.string().min(1),
        position_id: z.string().uuid(),
        college: z.string().optional(),
        description: z.string().optional(),
        past_leadership: z.string().optional(),
        grades: z.string().optional(),
        qualifications: z.string().optional(),
        image_url: z.string().url().optional(),
        platform: z.string().optional(),
      })
      .parse(body);
  }
}
