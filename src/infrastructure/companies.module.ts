import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';
import { CompaniesApplication } from 'src/core/application/companies.usecases';
import {
  CompanyRepository,
  TransferRepository,
} from 'src/core/domain/ports/outbound/repositories.ports';
import { PrismaCompanyRepository } from './persistence/prisma/company.repository';
import { CompaniesController } from './http/companies.controller';
import { TransfersApplication } from 'src/core/application/transfers.usecases';
import { TransfersController } from './http/transfers.controller';
import { PrismaTransferRepository } from './persistence/prisma/transfer.repository';
import { CompanyLambdaWriter } from './persistence/aws/company.lambda';
import { ConfigModule, ConfigType } from '@nestjs/config';
import envCompaniesLambda from './config/env.companies.lambda';
import { HybridCompanyRepository } from './persistence/aws/company.repository';

@Module({
  controllers: [CompaniesController, TransfersController],
  imports: [ConfigModule.forFeature(envCompaniesLambda)],
  providers: [
    // Prisma base
    PrismaService,
    PrismaCompanyRepository,
    { provide: TransferRepository, useClass: PrismaTransferRepository },

    // HTTP a Lambda
    {
      provide: CompanyLambdaWriter,
      inject: [envCompaniesLambda.KEY],
      useFactory: (cfg: ConfigType<typeof envCompaniesLambda>) =>
        new CompanyLambdaWriter(cfg.lambdaUrl, cfg.lambdaTimeoutMs),
    },

    /**
     * Switch de inyeccion de dependencias (adapter)
     * Si useAwsCompanyCreate === true y hay lambdaUrl → instancia HybridCompanyRepository
     * caso contrario → devuelve PrismaCompanyRepository
     */
    {
      provide: CompanyRepository,
      inject: [
        CompanyLambdaWriter,
        PrismaCompanyRepository,
        envCompaniesLambda.KEY,
      ],
      useFactory: (
        writer: CompanyLambdaWriter,
        prismaDefault: PrismaCompanyRepository,
        cfg: ConfigType<typeof envCompaniesLambda>,
      ) =>
        cfg.useAwsCompanyCreate && cfg.lambdaUrl
          ? new HybridCompanyRepository(writer, prismaDefault)
          : prismaDefault,
    },

    // Applications
    {
      provide: CompaniesApplication,
      useFactory: (companies: CompanyRepository) =>
        new CompaniesApplication(companies),
      inject: [CompanyRepository],
    },
    {
      provide: TransfersApplication,
      useFactory: (
        transfers: TransferRepository,
        companies: CompanyRepository,
      ) => new TransfersApplication(transfers, companies),
      inject: [TransferRepository, CompanyRepository],
    },
  ],
  exports: [CompaniesApplication, TransfersApplication],
})
export class CompaniesModule {}
