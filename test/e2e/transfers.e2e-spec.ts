import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CompaniesModule } from 'src/infrastructure/companies.module';
import { InMemoryCompanyRepository } from 'test/unit/fakes/in-memory-company.repository';
import { InMemoryTransferRepository } from 'test/unit/fakes/in-memory-transfer.repository';
import {
  CompanyRepository,
  TransferRepository,
} from 'src/core/domain/ports/outbound/repositories.ports';

describe('Transfers endpoints (E2E, in-memory)', () => {
  let app: INestApplication;
  let companiesFake: InMemoryCompanyRepository;
  let transfersFake: InMemoryTransferRepository;

  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    companiesFake = new InMemoryCompanyRepository();
    transfersFake = new InMemoryTransferRepository((id) =>
      companiesFake.getByIdInternal(id),
    );

    const moduleRef = await Test.createTestingModule({
      imports: [CompaniesModule],
    })
      .overrideProvider(CompanyRepository)
      .useValue(companiesFake)
      .overrideProvider(TransferRepository)
      .useValue(transfersFake)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  beforeEach(() => {
    companiesFake.clear();
    transfersFake.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /transfers → 404 si la empresa no existe', async () => {
    await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: '00000000-0000-0000-0000-000000000000', amount: 10 })
      .expect(404);
  });

  it('POST /transfers → 201 OK', async () => {
    const c = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'Acme', type: 'PYME' });

    const res = await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: c.body.id, amount: 95.67 })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      companyId: c.body.id,
      amount: 95.67,
      occurredAt: expect.any(String),
    });
  });

  it('GET /transfers → lista del último mes y filtro por companyId', async () => {
    const a = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'A', type: 'PYME' });
    const b = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'B', type: 'CORP' });

    await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: a.body.id, amount: 10 });
    await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: b.body.id, amount: 20 });
    await request(app.getHttpServer())
      .post('/transfers')
      .send({
        companyId: a.body.id,
        amount: 30,
        occurredAt: daysAgo(40).toISOString(),
      });

    const all = await request(app.getHttpServer())
      .get('/transfers/records')
      .expect(200);
    expect(
      all.body.transfers
        .map((t: any) => t.amount)
        .sort((x: number, y: number) => x - y),
    ).toEqual([10, 20]);

    const onlyA = await request(app.getHttpServer())
      .get(`/transfers/records?companyId=${a.body.id}`)
      .expect(200);
    expect(onlyA.body.transfers.map((t: any) => t.companyId)).toEqual([
      a.body.id,
    ]);
  });
});
