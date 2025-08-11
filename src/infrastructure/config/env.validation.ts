import * as Joi from 'joi';

export const envSchema = Joi.object({
  USE_AWS_COMPANY_CREATE: Joi.boolean().truthy('true', '1', 'yes', 'on').falsy('false', '0', 'no', 'off').default(false),
  LAMBDA_COMPANY_URL: Joi.string().uri().allow('').default(''),
  LAMBDA_TIMEOUT_MS: Joi.number().integer().min(500).default(2000),
});
