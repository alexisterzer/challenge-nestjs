import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CompaniesApplication } from '../../core/application/companies.usecases';
import { RegisterCompanyDto } from './dto/companies.dto';
import Utils from 'src/common/utils';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

/** Endpoints HTTP para empresas. */
@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  
  constructor(private readonly app: CompaniesApplication) {}

  /** Registra una empresa. */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Registrar empresa' })
  @ApiBody({ type: RegisterCompanyDto })
  @ApiCreatedResponse({
    description: 'Empresa registrada OK',
    schema: {
      example: {
        id: '1e203bd2-5135-4055-b9f5-587258dd5c16',
        name: 'Corpo 2 SRL',
        type: 'PYME',
        createdAt: '2025-08-10T19:58:14.342Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en tipo de empresa',
    schema: {
      example: {
        message: ['type => Debe ser PYME o CORP'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async register(@Body() dto: RegisterCompanyDto) {
    const created = await this.app.registerCompany({
      name: dto.name,
      type: dto.type,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    });

    return {
      id: created.id,
      name: created.name,
      type: created.type,
      createdAt: created.createdAt!.toISOString(),
    };
  }

  /** Obtiene empresas registradas durante los últimos 30 días. */
  @Get('registered')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Empresas registradas en el último mes' })
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
  async getRegistered() {
    const { since, until } = Utils.defaultWindow();
    const companies = await this.app.getCompaniesRegistered(since, until);

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
}
