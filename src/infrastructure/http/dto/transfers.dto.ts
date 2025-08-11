import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsDateString } from 'class-validator';

/** Payload para crear una transferencia. */
export class CreateTransferDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'uuid empresa',
    example: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
  })
  @IsUUID(undefined, {
    message:
      'companyId debe ser UUID, ejemplo => c10a9388-27f7-4fa6-9758-30efd1b1f22c',
  })
  companyId!: string;

  @ApiProperty({ type: 'number', description: 'Importe', example: 12345.67 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    description: 'Fecha de ocurrencia. Si no se envía, se usa la fecha actual.',
    example: '2025-08-10T19:58:14.342Z',
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

/** Query para listar transferencias. */
export class ListTransfersQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    description:
      'Filtra transferencias por empresa. Si no se especifica id, retorna todas las transferencias del período.',
    example: 'c10a9388-27f7-4fa6-9758-30efd1b1f22c',
  })
  @IsOptional()
  @IsUUID(undefined, {
    message:
      'companyId debe ser UUID, ejemplo => c10a9388-27f7-4fa6-9758-30efd1b1f22c',
  })
  companyId?: string;
}
