import * as dotenv from "dotenv";
import { Pool } from "pg";

const ENV = process.env.NODE_ENV || "development";

// dotenv.config({
//   path: `${__dirname}/../.env.${ENV}`,
// });
dotenv.config();
// if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
//   throw new Error("PGDATABASE or DATABASE_URL not set");
// }

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}

export default new Pool();
