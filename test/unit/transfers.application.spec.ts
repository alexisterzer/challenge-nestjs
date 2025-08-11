import { CompaniesApplication } from 'src/core/application/companies.usecases';
import { TransfersApplication } from 'src/core/application/transfers.usecases';
import { InMemoryCompanyRepository } from './fakes/in-memory-company.repository';
import { InMemoryTransferRepository } from './fakes/in-memory-transfer.repository';

describe('TransfersApplication (unit)', () => {
  const daysAgo = (base: Date, d: number) =>
    new Date(base.getTime() - d * 24 * 60 * 60 * 1000);

  it('createTransfer: ok si la empresa existe; error si no existe', async () => {
    const companiesRepo = new InMemoryCompanyRepository();
    const companiesApp = new CompaniesApplication(companiesRepo);

    const company = await companiesApp.registerCompany({
      name: 'Acme',
      type: 'PYME',
    });

    const transfersRepo = new InMemoryTransferRepository((id) =>
      companiesRepo.getByIdInternal(id),
    );

    const app = new TransfersApplication(
      transfersRepo as InMemoryTransferRepository,
      companiesRepo as InMemoryCompanyRepository,
    );

    const ok = await app.createTransfer({
      companyId: company.id,
      amount: 123.45,
    });
    expect(ok.id).toBeDefined();
    expect(ok.companyId).toBe(company.id);
    expect(ok.amount).toBe(123.45);

    await expect(
      app.createTransfer({ companyId: 'non-existent', amount: 10 }),
    ).rejects.toThrow('La empresa (companyId) no existe');
  });

  it('getTransfers: filtra por rango y por companyId', async () => {
    const companiesRepo = new InMemoryCompanyRepository();
    const companiesApp = new CompaniesApplication(companiesRepo);

    const now = new Date();
    const a = await companiesApp.registerCompany({ name: 'A', type: 'PYME' });
    const b = await companiesApp.registerCompany({ name: 'B', type: 'CORP' });

    const transfersRepo = new InMemoryTransferRepository((id) =>
      companiesRepo.getByIdInternal(id),
    );
    const app = new TransfersApplication(
      transfersRepo as InMemoryTransferRepository,
      companiesRepo as InMemoryCompanyRepository,
    );

    // datos
    await transfersRepo.create({
      companyId: a.id,
      amount: 10,
      occurredAt: daysAgo(now, 5),
    });
    await transfersRepo.create({
      companyId: b.id,
      amount: 20,
      occurredAt: daysAgo(now, 10),
    });
    await transfersRepo.create({
      companyId: a.id,
      amount: 30,
      occurredAt: daysAgo(now, 40),
    }); // fuera de rango

    const since = daysAgo(now, 30);
    const until = now;

    const all = await app.getTransfers(since, until);
    expect(all.map((t) => t.amount)).toEqual([20, 10]);

    const onlyA = await app.getTransfers(since, until, a.id);
    expect(onlyA.map((t) => t.amount)).toEqual([10]);
  });

  it('getCompaniesWithTransfers: devuelve Company[] únicos en rango', async () => {
    const companiesRepo = new InMemoryCompanyRepository();
    const companiesApp = new CompaniesApplication(companiesRepo);

    const now = new Date();
    const a = await companiesApp.registerCompany({ name: 'A', type: 'PYME' });
    const b = await companiesApp.registerCompany({ name: 'B', type: 'CORP' });

    const transfersRepo = new InMemoryTransferRepository((id) =>
      companiesRepo.getByIdInternal(id),
    );
    const app = new TransfersApplication(
      transfersRepo as InMemoryTransferRepository,
      companiesRepo as InMemoryCompanyRepository,
    );

    await transfersRepo.create({
      companyId: a.id,
      amount: 10,
      occurredAt: daysAgo(now, 5),
    });
    await transfersRepo.create({
      companyId: b.id,
      amount: 20,
      occurredAt: daysAgo(now, 10),
    });
    await transfersRepo.create({
      companyId: a.id,
      amount: 30,
      occurredAt: daysAgo(now, 40),
    }); // fuera de rango

    const since = daysAgo(now, 30);
    const until = now;

    const companies = await app.getCompaniesWithTransfers(since, until);
    expect(companies.map((c) => c.id).sort()).toEqual([a.id, b.id].sort());
  });
});
