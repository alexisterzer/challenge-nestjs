import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum CompanyTypeDto {
  PYME = 'PYME',
  CORP = 'CORP',
}

/** Payload para crear una empresa. */
export class RegisterCompanyDto {
  @ApiProperty({
    type: 'string',
    description: 'Nombre de la empresa',
    example: 'Corpo SRL',
  })
  @MinLength(1, { message: 'name => No puede ser nulo o vacío' })
  @IsString({ message: 'name => No puede ser nulo o vacío' })
  name!: string;

  @ApiProperty({
    enum: CompanyTypeDto,
    enumName: 'CompanyType',
    description: 'Tipo de empresa',
    example: CompanyTypeDto.PYME,
  })
  @IsEnum(CompanyTypeDto, { message: 'type => Debe ser PYME o CORP' })
  type!: CompanyTypeDto;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    description: 'Fecha de creación. Si no se envía, se usa la fecha actual.',
    example: '2025-08-10T19:58:14.342Z',
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
