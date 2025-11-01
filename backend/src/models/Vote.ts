export class Vote {
  constructor(
    public readonly id: string,
    public readonly voterId: string,
    public readonly candidateId: string | null,
    public readonly positionId: string,
    public readonly instituteId: string,
    public readonly createdAt: Date,
  ) {}
}
