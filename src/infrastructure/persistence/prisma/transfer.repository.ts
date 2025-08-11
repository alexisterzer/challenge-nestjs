import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Transfer as PrismaTransfer } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { TransferRepository } from 'src/core/domain/ports/outbound/repositories.ports';
import { Company } from 'src/core/domain/entities/company';
import { Transfer } from 'src/core/domain/entities/transfer';

@Injectable()
export class PrismaTransferRepository implements TransferRepository {
  private readonly logger = new Logger(PrismaTransferRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Obtiene empresas con al menos una transferencia dentro de un rango de fechas. */
  async findCompaniesWithTransfersBetween(
    since: Date,
    until: Date,
  ): Promise<Company[]> {
    try {
      this.logger.log(
        `Obteniendo empresas con al menos una transferencia desde ${since.toISOString()} hasta ${until.toISOString()}`,
      );
      const rows = await this.prisma.transfer.findMany({
        where: { occurredAt: { gte: since, lte: until } },
        distinct: ['companyId'],
        select: {
          company: true,
        },
        orderBy: { occurredAt: 'asc' },
      });

      return rows.map((r) => ({
        id: r.company.id,
        name: r.company.name,
        type: r.company.type as Company['type'],
        createdAt: r.company.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Obteniendo empresas => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /** Busca transferencias en ventana; filtra por companyId si se especifica. */
  async findTransfersBetween(
    since: Date,
    until: Date,
    companyId?: string,
  ): Promise<Transfer[]> {
    try {
      this.logger.log(
        `Obteniendo transferencias desde ${since.toISOString()} hasta ${until.toISOString()}, empresa: ${companyId}`,
      );
      const where: Prisma.TransferWhereInput = {
        occurredAt: { gte: since, lte: until },
        ...(companyId ? { companyId } : {}),
      };
      const rows = await this.prisma.transfer.findMany({
        where,
        orderBy: { occurredAt: 'asc' },
      });
      return rows.map(this.mapTransfer);
    } catch (error) {
      this.logger.error(
        `Obteniendo transferencias => ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  /** Crea una transferencia para una empresa */
  async create(input: Omit<Transfer, 'id'>): Promise<Transfer> {
    try {
      const data: Prisma.TransferCreateInput = {
        amount: new Prisma.Decimal(input.amount),
        occurredAt: input.occurredAt,
        company: { connect: { id: input.companyId } },
      };
      const created = await this.prisma.transfer.create({ data });
      this.logger.log(`Transferencia creada => ${JSON.stringify(created)}`);
      return this.mapTransfer(created);
    } catch (error) {
      this.logger.error(`Creando transferencia => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /** Mapea Prisma.Transfer a dominio Transfer. */
  private mapTransfer(row: PrismaTransfer): Transfer {
    return {
      id: row.id,
      companyId: row.companyId,
      amount: Number(row.amount),
      occurredAt: row.occurredAt,
    };
  }
}
