import { Injectable, Logger } from '@nestjs/common';
import { CompanyType, Prisma, Company as PrismaCompany } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { CompanyRepository } from 'src/core/domain/ports/outbound/repositories.ports';
import { Company } from 'src/core/domain/entities/company';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  private readonly logger = new Logger(PrismaCompanyRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Crea una empresa. */
  async create(input: Omit<Company, 'id'>): Promise<Company> {
    try {
      const data: Prisma.CompanyCreateInput = {
        name: input.name,
        type: input.type as CompanyType,
        ...(input.createdAt ? { createdAt: input.createdAt } : {}),
      };

      const created = await this.prisma.company.create({ data });
      this.logger.log(`Empresa registrada => ${JSON.stringify(created)}`);
      return this.mapCompany(created);
    } catch (error) {
      this.logger.error(`Registrando empresa => ${JSON.stringify(input)}`);
      throw error;
    }
  }

  /** Obtiene empresas por rango de fechas (de creación). */
  async findRegisteredBetween(since: Date, until: Date): Promise<Company[]> {
    try {
      this.logger.log(
        `Obteniendo empresas registradas desde ${since.toISOString()} hasta ${until.toISOString()}`,
      );
      const rows = await this.prisma.company.findMany({
        where: { createdAt: { gte: since, lte: until } },
        orderBy: { createdAt: 'asc' },
      });
      return rows.map(this.mapCompany);
    } catch (error) {
      this.logger.error(`Obteniendo empresas => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /** Valida existencia de empresa por id */
  async existsById(id: string): Promise<boolean> {
    const row = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!row;
  }

  /** Mapea Prisma.Company a dominio Company. */
  private mapCompany(row: PrismaCompany): Company {
    return {
      id: row.id,
      name: row.name,
      type: row.type as Company['type'],
      createdAt: row.createdAt,
    };
  }
}
