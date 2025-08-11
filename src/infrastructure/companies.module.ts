import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';
import { CompaniesApplication } from 'src/core/application/companies.usecases';
import {
  CompanyRepository,
  TransferRepository,
} from 'src/core/domain/ports/outbound/repositories.ports';
import {
  PrismaCompanyRepository,
} from './persistence/prisma/company.repository';
import { CompaniesController } from './http/companies.controller';
import { TransfersApplication } from 'src/core/application/transfers.usecases';
import { TransfersController } from './http/transfers.controller';
import { PrismaTransferRepository } from './persistence/prisma/transfer.repository';

@Module({
  controllers: [CompaniesController, TransfersController],
  providers: [
    PrismaService,
    { provide: CompanyRepository, useClass: PrismaCompanyRepository },
    { provide: TransferRepository, useClass: PrismaTransferRepository },
    {
      provide: CompaniesApplication,
      useFactory: (companies: CompanyRepository) =>
        new CompaniesApplication(companies),
      inject: [CompanyRepository],
    },
    {
      provide: TransfersApplication,
      useFactory: (transfers: TransferRepository, companies: CompanyRepository) =>
        new TransfersApplication(transfers, companies),
      inject: [TransferRepository, CompanyRepository],
    },
  ],
  exports: [CompaniesApplication, TransfersApplication],
})
export class CompaniesModule {}
