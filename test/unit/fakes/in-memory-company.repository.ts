import { randomUUID } from 'crypto';
import { Company } from 'src/core/domain/entities/company';
import { CompanyRepository } from 'src/core/domain/ports/outbound/repositories.ports';

export class InMemoryCompanyRepository implements CompanyRepository {
  private items: Company[] = [];

  async create(input: Omit<Company, 'id'>): Promise<Company> {
    const row: Company = {
      id: randomUUID(),
      name: input.name,
      type: input.type,
      createdAt: input.createdAt ?? new Date(),
    };
    this.items.push(row);
    return row;
  }

  async findRegisteredBetween(since: Date, until: Date): Promise<Company[]> {
    return this.items
      .filter((c) => c.createdAt! >= since && c.createdAt! <= until)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async existsById(id: string): Promise<boolean> {
    return this.items.some((c) => c.id === id);
  }

  getByIdInternal(id: string): Company | undefined {
    return this.items.find((c) => c.id === id);
  }

  clear(): void {
    this.items = [];
  }
}
