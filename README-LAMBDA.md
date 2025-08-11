<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción

Objetivo: Diseñar una <b>Lambda Function</b> de AWS que reciba una solicitud de adhesión de empresa, valide los datos y los almacene, aprovechando el diseño Hexagonal, podemos cambiar la infraestructura del microservicio sin modificar el core.

#### Ejemplo de implementación
- Agregar adapter <b>CompanyLambdaWriter</b> ```infrastructure/persistence/aws/company.lambda.ts```
- Agregar repositorio <b>HybridCompanyRepository</b>, método: <b>create()</b> responsable de ejecutar la lambda.
- Ajustar módulo <b>CompaniesModule</b>, con variables de entorno definimos el camino, Lambda (hibrido) o Prisma.

- Rama de ejemplo de implementación: ```example/aws-lambda```

Para la demo, se simula una configuración desde AWS para exponer la Lambda mediante <b>URL de función</b> y <b>sin autentificación</b> y guardado de datos en db <b>DynamoDB</b>. Realizando las mismas validaciones en el <b>nombre</b> y <b>tipo de empresa</b> a registrar.



### Código Lambda
```
import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DDB_TABLE_COMPANIES || 'Companies';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Extrae el JSON del body
function extractPayload(event) {
  if (event && typeof event === 'object') {
    if (typeof event.body === 'string') return JSON.parse(event.body);
    if (event.body && typeof event.body === 'object') return event.body;
  }
  return {};
}

// Valida name/type y createdAt opcional
function validate(input) {
  const name = input?.name;
  const type = input?.type;
  const createdAtRaw = input?.createdAt;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError("name => No puede ser nulo o vacío");
  }
  if (type !== 'PYME' && type !== 'CORP') {
    throw new ValidationError("type => Debe ser PYME o CORP");
  }

  let createdAt;
  if (createdAtRaw !== undefined) {
    const d = new Date(createdAtRaw);
    if (Number.isNaN(d.getTime())) {
      throw new ValidationError("Error 'createdAt' (debe ser ISO-8601).");
    }
    createdAt = d;
  }

  return { name: name.trim(), type, createdAt };
}

// Respuesta
function respond(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyObj),
  };
}

export const handler = async (event) => {
  try {
    const payload = extractPayload(event);
    const { name, type, createdAt } = validate(payload);

    const item = {
      id: randomUUID(),
      name,
      type, // 'PYME' | 'CORP'
      createdAt: (createdAt ?? new Date()).toISOString(),
    };

    // Simulamos DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    return respond(201, item);
  } catch (err) {
    // JSON inválido
    if (err instanceof SyntaxError) {
      return respond(400, { message: 'Error en JSON' });
    }
    // Validación de dominio
    if (err instanceof ValidationError) {
      return respond(400, { message: err.message });
    }
    // Error no controlado
    console.error('Unhandled error:', err);
    return respond(500, { message: 'Internal error' });
  }
};
```

### Input esperado:

```
{
  "name": "Corpo SRL",
  "type": "PYME",
  "createdAt": "2025-08-10T19:58:14.342Z" // opcional, la lambda lo establece si no llega
}
```

### Output esperado:

```
{
  "id": "1e203bd2-5135-4055-b9f5-587258dd5c16",
  "name": "Corpo 2 SRL",
  "type": "PYME",
  "createdAt": "2025-08-10T19:58:14.342Z"
}
```


## Contacto

- Desarrollador - Sterzer Alexis
