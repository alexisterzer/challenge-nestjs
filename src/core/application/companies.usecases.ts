import { Company } from '../domain/entities/company';
import { CompanyRepository } from '../domain/ports/outbound/repositories.ports';

/** Orquesta operaciones de aplicación (empresas). */
export class CompaniesApplication {
  constructor(private readonly companies: CompanyRepository) {}

  /** Registra una empresa. */
  async registerCompany(input: {
    name: string;
    type: Company['type'];
    createdAt?: Date;
  }): Promise<Company> {
    const payload = {
      name: input.name,
      type: input.type,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    };
    return this.companies.create(payload);
  }

  /** Obtiene empresas registradas dentro de un rango. */
  async getCompaniesRegistered(since: Date, until: Date): Promise<Company[]> {
    return this.companies.findRegisteredBetween(since, until);
  }
}
