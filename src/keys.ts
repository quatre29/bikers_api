export interface DBKeys {
  pgUser: string;
  pgHost: string;
  pgDatabase: string;
  pgPassword: string;
  pgPort: number;
}

export const DB_KEYS: DBKeys = {
  pgUser: process.env.PGUSER!,
  pgHost: process.env.PGHOST!,
  pgDatabase: process.env.PGDATABASE!,
  pgPassword: process.env.PGPASSWORD!,
  pgPort: +process.env.PGPORT!,
};
