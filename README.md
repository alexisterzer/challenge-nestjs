<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción

<b>Challenge</b>: Microservicio NestJS (standalone) para gestionar empresas y sus transferencias, construido con Arquitectura Hexagonal, priorizando separación de responsabilidades y escalabilidad.

- Persistencia local con SQLite embebido vía Prisma.
- Swagger habilitado para probar endpoints.
- Pruebas unitarias y E2E.
- Node 22, NestJS 11

## Entrega
Requerimientos funcionales:
- Empresas con transferencias en el último mes → ```GET /transfers/companies```
    - Retorna Company[] con al menos una transferencia (últimos 30 días, ventana por defecto).
- Empresas adheridas en el último mes → ```GET /companies/registered```
    - Retorna Company[] creadas en últimos 30 días.
- Registrar una nueva empresa (Pyme o Corporativa) → ```POST /companies/register```

Ejemplo (body):
```
{
  "name": "Corpo SRL",
  "type": "PYME", //o CORP
  "createdAt": "2025-08-10T19:58:14.342Z"
}
```

Extras útiles:
- Crear transferencia para una empresa → ```POST /transfers```

Ejemplo (body):
```
{
  "companyId": "c10a9388-27f7-4fa6-9758-30efd1b1f22c",
  "amount": 12345.67,
  "occurredAt": "2025-08-10T19:58:14.342Z"
}
```

- Obtener transferencias de los últ. 30 días (opcional filtro por ```companyId```) → ```GET /transfers/records?companyId=...```

## Arquitectura Hexagonal

#### Core (agnóstico a NestJS)
- Domain: entidades (Company, Transfer)
- Ports (outbound): clases abstractas (<b>CompanyRepository</b> y <b>TransferRepository</b>)
- Application: orquestación de casos de uso
    - <b>CompaniesApplication</b>: Registra una empresa y Obtiene empresas registradas dentro de un rango.
    - <b>TransfersApplication</b>: Obtiene empresa con al menos una transf. realizada dentro de un rago, crear y listar.

#### Infrastructure
- Inbound (HTTP): <b>CompaniesController</b>, <b>TransfersController</b> → validan DTOs, calculan la ventana por defecto (30 días) y llaman a Application.
- Outbound (DB): <b>PrismaCompanyRepository</b>, <b>PrismaTransferRepository</b> → implementan los ports (del negocio) con Prisma + SQLite.

#### CompaniesModule: punto de composición (wiring)
- Vincula ports (negocio) → adapters (infra),
- Crea <b>CompaniesApplication</b> y <b>TransfersApplication</b> con factory providers (core libre de decoradores Nest)
- Expone controllers


#### Dirección de dependencias

```HTTP → Controller (inbound) → Application (core) → Ports (core) → Prisma Repos (outbound) → SQLite```

Infra depende del core; el core NO depende de infra.

# Configuración del proyecto

```bash
$ npm install
$ npm run setup
```
Este paso 2 (npm run setup) configura Prisma + SQLite (crea DB, configura schema y migra datos ya creados)

### Compilar y ejecutar el proyecto

```bash
$ npm run start:dev
```

```
API y Swagger por defecto
http://localhost:3000/
```

### Ejecutar test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Contacto

- Desarrollador - Sterzer Alexis
