import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** Inicio de conexión. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Cierre de conexión. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
