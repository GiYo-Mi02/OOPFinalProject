import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { VoteService } from "../services/VoteService";

export class VoteController {
  constructor(private readonly service = new VoteService()) {}

  getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { instituteId } = this.parseParams(req.params);
      const leaderboard = await this.service.getLeaderboard(instituteId);
      res.status(200).json({ instituteId, leaderboard });
    } catch (error) {
      next(error);
    }
  };

  castVote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const voteData = this.parseVoteBody(req.body);
      const result = await this.service.castVote(userId, voteData);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  checkVoteStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { electionId } = this.parseElectionParams(req.params);
      const hasVoted = await this.service.checkIfUserVoted(userId, electionId);
      res.status(200).json({ hasVoted });
    } catch (error) {
      next(error);
    }
  };

  getActiveElections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const instituteId = req.user?.instituteId;
      const elections = await this.service.getActiveElections(instituteId);
      res.status(200).json({ elections });
    } catch (error) {
      next(error);
    }
  };

  getElectionCandidates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { electionId } = this.parseElectionParams(req.params);
      const candidates = await this.service.getElectionCandidates(electionId);
      res.status(200).json({ candidates });
    } catch (error) {
      next(error);
    }
  };

  private parseParams(params: unknown) {
    return z
      .object({
        instituteId: z.string().min(1),
      })
      .parse(params);
  }

  private parseElectionParams(params: unknown) {
    return z
      .object({
        electionId: z.string().uuid(),
      })
      .parse(params);
  }

  private parseVoteBody(body: unknown) {
    return z
      .object({
        electionId: z.string().uuid(),
        votes: z.array(
          z.object({
            positionId: z.string().uuid(),
            candidateId: z.string().uuid().or(z.literal("abstain")),
          })
        ),
      })
      .parse(body);
  }
}
