import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import Utils from 'src/common/utils';
import { TransfersApplication } from 'src/core/application/transfers.usecases';
import { CreateTransferDto, ListTransfersQueryDto } from './dto/transfers.dto';

/** Endpoints HTTP para transferencias. */
@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly app: TransfersApplication) {}

  /** Obtiene empresas con transferencias durante los últimos 30 días. */
  @Get('/companies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Empresas con transferencias en el último mes' })
  @ApiOkResponse({
    description: 'Listado de empresas',
    schema: {
      example: {
        window: {
          since: '2025-07-11T19:55:15.284Z',
          until: '2025-08-10T19:55:15.284Z',
        },
        companies: [
          {
            id: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
            name: 'Corpo SRL',
            type: 'PYME',
            createdAt: '2025-08-10T19:53:56.054Z',
          },
        ],
      },
    },
  })
  async getWithTransfers() {
    const { since, until } = Utils.defaultWindow();
    const companies = await this.app.getCompaniesWithTransfers(since, until);

    return {
      window: { since: since.toISOString(), until: until.toISOString() },
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        createdAt: c.createdAt!.toISOString(),
      })),
    };
  }

  /** Crea una transferencia. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Crear transferencia' })
  @ApiBody({ type: CreateTransferDto })
  @ApiCreatedResponse({
    description: 'Transferencia creada',
    schema: {
      example: {
        id: 'a2f7c7a7-4e3a-4c2a-8f8b-8e86f1f0a111',
        companyId: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
        amount: 12345.67,
        occurredAt: '2025-08-10T19:58:14.342Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en ID de empresa',
    schema: {
      example: {
        message: [
          'companyId debe ser UUID, ejemplo => c10a9388-27f7-4fa6-9758-30efd1b1f22c',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createTransfer(@Body() dto: CreateTransferDto) {
    const created = await this.app.createTransfer({
      companyId: dto.companyId,
      amount: dto.amount,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
    });
    return {
      id: created.id,
      companyId: created.companyId,
      amount: created.amount,
      occurredAt: created.occurredAt!.toISOString(),
    };
  }

  /** Lista transferencias de los últimos 30 días; filtra por compañía si se indica. */
  @Get('records')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Transferencias del último mes (opcional: filtrar por compañía)',
  })
  @ApiOkResponse({
    description: 'Listado de transferencias',
    schema: {
      example: {
        window: {
          since: '2025-07-11T19:55:15.284Z',
          until: '2025-08-10T19:55:15.284Z',
        },
        filters: {
          companyId: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
        },
        transfers: [
          {
            id: 'a2f7c7a7-4e3a-4c2a-8f8b-8e86f1f0a111',
            companyId: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
            amount: 12345.67,
            occurredAt: '2025-08-10T19:58:14.342Z',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en ID de empresa',
    schema: {
      example: {
        message: [
          'companyId debe ser UUID, ejemplo => c10a9388-27f7-4fa6-9758-30efd1b1f22c',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async listTransfers(@Query() q: ListTransfersQueryDto) {
    const { since, until } = Utils.defaultWindow();
    const transfers = await this.app.getTransfers(since, until, q.companyId);
    return {
      window: { since: since.toISOString(), until: until.toISOString() },
      filters: { companyId: q.companyId ?? null },
      transfers: transfers.map((t) => ({
        id: t.id,
        companyId: t.companyId,
        amount: t.amount,
        occurredAt: t.occurredAt.toISOString(),
      })),
    };
  }
}
