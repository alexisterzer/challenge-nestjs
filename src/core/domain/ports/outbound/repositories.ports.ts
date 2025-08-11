import { Company } from '../../entities/company';
import { Transfer } from '../../entities/transfer';

/** Operaciones de lectura y escritura para empresas. */
export abstract class CompanyRepository {
  /** Crea una empresa. */
  abstract create(input: Omit<Company, 'id'>): Promise<Company>;

  /** Obtiene empresas registradas dentro de un rango de fechas. */
  abstract findRegisteredBetween(since: Date, until: Date): Promise<Company[]>;

  /** Indica si existe una empresa por id. */
  abstract existsById(id: string): Promise<boolean>;
}

/** Operaciones de lectura y escritura para transferencias. */
export abstract class TransferRepository {
  /** Obtiene llas empresas CON transferencias dentro de un rango de fechas. */
  abstract findCompaniesWithTransfersBetween(
    since: Date,
    until: Date,
  ): Promise<Company[]>;

  /** Crea una transferencia. */
  abstract create(input: Omit<Transfer, 'id'>): Promise<Transfer>;

  /** Obtiene transferencias dentro de un rango; es posible filtrar por empresa. */
  abstract findTransfersBetween(
    since: Date,
    until: Date,
    companyId?: string,
  ): Promise<Transfer[]>;
}
