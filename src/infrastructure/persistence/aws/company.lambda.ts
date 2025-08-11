import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  BadGatewayException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Company } from 'src/core/domain/entities/company';

/** HTTP para ejecutar Lambda que registra empresa. */
export class CompanyLambdaWriter {
  private readonly http: AxiosInstance;

  constructor(private readonly url: string, timeoutMs = 2000) {
    this.http = axios.create({
      baseURL: url,
      timeout: timeoutMs,
      headers: { 'content-type': 'application/json' },
    });
  }

  /** POST a la Lambda; devuelve Company de dominio. */
  async create(input: Omit<Company, 'id'>): Promise<Company> {
    try {
      const payload = {
        name: input.name,
        type: input.type, // 'PYME' | 'CORP'
        ...(input.createdAt ? { createdAt: input.createdAt.toISOString() } : {}),
      };

      const res = await this.http.post('', payload);

      if (res.status !== 201 || !res.data) {
        throw new InternalServerErrorException(`Lambda error: ${res.status}`);
      }

      const body = res.data as Company;

      return body;
    } catch (e) {
      const err = e as AxiosError<any>;

      // Timeout
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        throw new BadGatewayException('Lambda timeout');
      }
      if (!err.response) {
        // sin response = fallo de red/DNS/etc.
        throw new BadGatewayException(err.message || 'Lambda unreachable');
      }

      const status = err.response.status;
      const msg =
        (err.response.data && (err.response.data.message || err.response.data.error)) ||
        'Lambda error';

      if (status === 400) throw new BadRequestException(msg);   // error controlado (Lambda)
      if (status >= 500) throw new BadGatewayException(msg);    // error NO controlado (Lambda)
      throw new InternalServerErrorException(`Lambda ${status}: ${msg}`);
    }
  }
}
