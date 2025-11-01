"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vote = void 0;
class Vote {
    constructor(id, voterId, candidateId, positionId, instituteId, createdAt) {
        this.id = id;
        this.voterId = voterId;
        this.candidateId = candidateId;
        this.positionId = positionId;
        this.instituteId = instituteId;
        this.createdAt = createdAt;
    }
}
exports.Vote = Vote;
