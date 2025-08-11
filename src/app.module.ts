import { Module } from '@nestjs/common';
import { CompaniesModule } from './infrastructure/companies.module';

@Module({
  imports: [CompaniesModule]
})
export class AppModule {}
