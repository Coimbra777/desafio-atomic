import { join } from 'node:path';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

type DatabaseEnvironment = {
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
};

function parsePort(value?: string): number {
  const port = Number(value ?? '5432');

  if (Number.isNaN(port)) {
    return 5432;
  }

  return port;
}

export function buildTypeOrmOptions(
  environment: DatabaseEnvironment,
): TypeOrmModuleOptions & DataSourceOptions {
  return {
    type: 'postgres',
    host: environment.host ?? 'postgres',
    port: parsePort(environment.port),
    username: environment.username ?? 'taskflow',
    password: environment.password ?? 'taskflow',
    database: environment.database ?? 'taskflow',
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: true,
    logging: false,
    retryAttempts: 10,
    retryDelay: 3000,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  };
}
