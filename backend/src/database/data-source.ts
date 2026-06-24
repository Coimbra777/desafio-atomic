import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

import { buildTypeOrmOptions } from './typeorm.config';

loadEnv();

const dataSourceOptions = buildTypeOrmOptions({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export const appDataSource = new DataSource(dataSourceOptions);

export default appDataSource;

