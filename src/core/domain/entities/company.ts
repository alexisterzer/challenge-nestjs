export type CompanyType = 'PYME' | 'CORP';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  createdAt?: Date;
}
