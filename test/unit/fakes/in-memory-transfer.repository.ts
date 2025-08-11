import { randomUUID } from 'crypto';
import { Company } from 'src/core/domain/entities/company';
import { Transfer } from 'src/core/domain/entities/transfer';
import { TransferRepository } from 'src/core/domain/ports/outbound/repositories.ports';

export class InMemoryTransferRepository implements TransferRepository {
  private items: Transfer[] = [];

  constructor(
    private readonly companiesLookup: (id: string) => Company | undefined,
  ) {}

  async create(input: Omit<Transfer, 'id'>): Promise<Transfer> {
    const row: Transfer = {
      id: randomUUID(),
      companyId: input.companyId,
      amount: input.amount,
      occurredAt: input.occurredAt ?? new Date(),
    };
    this.items.push(row);
    return row;
  }

  async findTransfersBetween(
    since: Date,
    until: Date,
    companyId?: string,
  ): Promise<Transfer[]> {
    return this.items
      .filter((t) => t.occurredAt >= since && t.occurredAt <= until)
      .filter((t) => (companyId ? t.companyId === companyId : true))
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  async findCompaniesWithTransfersBetween(
    since: Date,
    until: Date,
  ): Promise<Company[]> {
    const ids = new Set(
      this.items
        .filter((t) => t.occurredAt >= since && t.occurredAt <= until)
        .map((t) => t.companyId),
    );

    const companies: Company[] = [];
    ids.forEach((id) => {
      const c = this.companiesLookup(id);
      if (c) companies.push(c);
    });

    return companies.sort(
      (a, b) => a.createdAt!.getTime() - b.createdAt!.getTime(),
    );
  }

  clear(): void {
    this.items = [];
  }
}
