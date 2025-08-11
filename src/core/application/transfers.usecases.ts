import { NotFoundException } from '@nestjs/common';
import { Company } from '../domain/entities/company';
import { Transfer } from '../domain/entities/transfer';
import {
  CompanyRepository,
  TransferRepository,
} from '../domain/ports/outbound/repositories.ports';

/** Orquesta operaciones de aplicación (transferencias). */
export class TransfersApplication {
  constructor(
    private readonly transfers: TransferRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** Obtiene empresas con al menos una transferencia dentro de un rango. */
  async getCompaniesWithTransfers(
    since: Date,
    until: Date,
  ): Promise<Company[]> {
    return this.transfers.findCompaniesWithTransfersBetween(since, until);
  }

  /** Obtiene transferencias en rango; filtra por compañía si se indica. */
  async getTransfers(
    since: Date,
    until: Date,
    companyId?: string,
  ): Promise<Transfer[]> {
    return this.transfers.findTransfersBetween(since, until, companyId);
  }

  /** Crea una transferencia. */
  async createTransfer(input: {
    companyId: string;
    amount: number;
    occurredAt?: Date;
  }): Promise<Transfer> {
    try {
      const exists = await this.companies.existsById(input.companyId);
      if (!exists) {
        throw new NotFoundException({
          message: 'La empresa (companyId) no existe',
        });
      }

      const payload: Omit<Transfer, 'id'> = {
        companyId: input.companyId,
        amount: input.amount,
        occurredAt: input.occurredAt ?? new Date(),
      };
      return this.transfers.create(payload);
    } catch (error) {
      throw error;
    }
  }
}
