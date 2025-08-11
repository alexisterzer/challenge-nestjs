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

describe('Challenge endpoints (E2E, in-memory)', () => {
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

  it('POST /companies/register → Crear empresa', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'Corpo SRL', type: 'PYME' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Corpo SRL',
      type: 'PYME',
      createdAt: expect.any(String),
    });
  });

  it('GET /companies/registered → empresas registradas en el último mes', async () => {
    const old = daysAgo(40).toISOString();
    await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'Old', type: 'CORP', createdAt: old });
    await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'A', type: 'PYME' });
    await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'B', type: 'CORP' });

    const res = await request(app.getHttpServer())
      .get('/companies/registered')
      .expect(200);

    expect(res.body.window).toEqual({
      since: expect.any(String),
      until: expect.any(String),
    });
    expect(res.body.companies.map((c: any) => c.name)).toEqual(['A', 'B']);
  });

  it('GET /transfers/companies → empresas con transferencias en el último mes', async () => {
    const c1 = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'X', type: 'PYME' });
    const c2 = await request(app.getHttpServer())
      .post('/companies/register')
      .send({ name: 'Y', type: 'CORP' });

    await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: c1.body.id, amount: 100.5 });
    await request(app.getHttpServer())
      .post('/transfers')
      .send({ companyId: c2.body.id, amount: 50.1 });
    await request(app.getHttpServer())
      .post('/transfers')
      .send({
        companyId: c1.body.id,
        amount: 9.99,
        occurredAt: daysAgo(40).toISOString(),
      });

    const res = await request(app.getHttpServer())
      .get('/transfers/companies')
      .expect(200);

    const names = res.body.companies.map((c: any) => c.name).sort();
    expect(names).toEqual(['X', 'Y']);
  });
});
