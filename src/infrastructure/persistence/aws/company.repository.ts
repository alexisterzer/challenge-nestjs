import { Injectable } from '@nestjs/common';
import { Company } from 'src/core/domain/entities/company';
import { PrismaCompanyRepository } from '../prisma/company.repository';
import { CompanyLambdaWriter } from './company.lambda';
import { CompanyRepository } from 'src/core/domain/ports/outbound/repositories.ports';

/** Escribe vía Lambda, lee vía Prisma (simulación). */
@Injectable()
export class HybridCompanyRepository implements CompanyRepository {
  constructor(
    private readonly writer: CompanyLambdaWriter,
    private readonly reader: PrismaCompanyRepository,
  ) {}

  create(input: Omit<Company, 'id'>): Promise<Company> {
    return this.writer.create(input);
  }

  findRegisteredBetween(since: Date, until: Date): Promise<Company[]> {
    return this.reader.findRegisteredBetween(since, until);
  }

  existsById(id: string): Promise<boolean> {
    return this.reader.existsById(id);
  }
}
