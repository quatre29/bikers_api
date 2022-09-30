import * as dotenv from "dotenv";
import { DB_KEYS } from "../keys";

import { Pool } from "pg";

const ENV = process.env.NODE_ENV || "development";

dotenv.config({
  path: `${__dirname}/../../.env.${ENV}`,
});

const CONFIG = {
  user: DB_KEYS.pgUser,
  host: DB_KEYS.pgHost,
  database: DB_KEYS.pgDatabase,
  password: DB_KEYS.pgPassword,
  port: DB_KEYS.pgPort,
};

console.log(
  CONFIG,
  "00000000000000000000000000000000000000000000000000000s000000000000000"
);

// if (!process.env.POSTGRES_DATABASE && !process.env.DATABASE_URL) {
//   console.log(process.env.POSTGRES_DATABASE, process.env.DATABASE_URL);
//   throw new Error("POSTGRES_DATABASE or DATABASE_URL not set");
// }

// const config =
//   ENV === "production"
//     ? {
//         // connectionString: process.env.DATABASE_URL,
//         // ssl: {
//         //   rejectUnauthorized: false,
//         // },
//       }
//     : {};

export default new Pool(CONFIG);
