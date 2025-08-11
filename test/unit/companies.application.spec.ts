import { CompaniesApplication } from "src/core/application/companies.usecases";
import { InMemoryCompanyRepository } from "./fakes/in-memory-company.repository";

describe('CompaniesApplication', () => {
  it('registerCompany crea una empresa', async () => {
    const repo = new InMemoryCompanyRepository();
    const app = new CompaniesApplication(repo);

    const created = await app.registerCompany({
      name: 'Acme S.A.',
      type: 'PYME',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Acme S.A.');
    expect(created.type).toBe('PYME');
    expect(created.createdAt instanceof Date).toBe(true);
  });

  it('registerCompany respeta createdAt si se envía', async () => {
    const repo = new InMemoryCompanyRepository();
    const app = new CompaniesApplication(repo);

    const createdAt = new Date('2025-08-01T00:00:00.000Z');
    const created = await app.registerCompany({
      name: 'Beta SRL',
      type: 'CORP',
      createdAt,
    });

    expect(created.createdAt!.toISOString()).toBe(createdAt.toISOString());
  });

  it('getCompaniesRegistered filtra por rango (último mes)', async () => {
    const repo = new InMemoryCompanyRepository();
    const app = new CompaniesApplication(repo);

    const now = new Date();
    const daysAgo = (d: number) =>
      new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    await app.registerCompany({
      name: 'Old Co',
      type: 'PYME',
      createdAt: daysAgo(40),
    }); // fuera de rango
    const c1 = await app.registerCompany({
      name: 'Recent A',
      type: 'PYME',
      createdAt: daysAgo(10),
    });
    const c2 = await app.registerCompany({
      name: 'Recent B',
      type: 'CORP',
      createdAt: daysAgo(5),
    });

    const since = daysAgo(30);
    const until = now;

    const list = await app.getCompaniesRegistered(since, until);

    expect(list.map((c) => c.id)).toEqual([c1.id, c2.id]);
  });
});
