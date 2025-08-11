import { registerAs } from '@nestjs/config';

export default registerAs('companies', () => ({
  useAwsCompanyCreate: process.env.USE_AWS_COMPANY_CREATE === 'true',
  lambdaUrl: process.env.LAMBDA_COMPANY_URL ?? 'https://j2jxykj2rtw4mg3gk3llcep6wy0tchso.lambda-url.us-east-1.on.aws/',
  lambdaTimeoutMs: Number(process.env.LAMBDA_TIMEOUT_MS ?? 2000),
}));
