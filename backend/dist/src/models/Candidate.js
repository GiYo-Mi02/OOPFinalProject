"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Candidate = void 0;
class Candidate {
    constructor(id, name, positionId, instituteId, slate, avatarUrl) {
        this.id = id;
        this.name = name;
        this.positionId = positionId;
        this.instituteId = instituteId;
        this.slate = slate;
        this.avatarUrl = avatarUrl;
    }
}
exports.Candidate = Candidate;
