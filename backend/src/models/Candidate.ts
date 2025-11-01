export class Candidate {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly positionId: string,
    public readonly instituteId: string,
    public readonly slate?: string,
    public readonly avatarUrl?: string,
  ) {}
}
