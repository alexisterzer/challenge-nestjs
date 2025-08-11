import { Module } from '@nestjs/common';
import { CompaniesModule } from './infrastructure/companies.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './infrastructure/config/env.validation';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    CompaniesModule,
  ],
})
export class AppModule {}
