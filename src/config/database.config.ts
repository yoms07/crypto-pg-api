import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  mongo_uri: string;
  mongo_db_name: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    mongo_uri: process.env.MONGO_URI!,
    mongo_db_name: process.env.MONGO_DB_NAME!,
  }),
);
