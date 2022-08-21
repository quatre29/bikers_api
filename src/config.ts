import * as dotenv from "dotenv";
import { resolve } from "path";

switch (process.env.NODE_ENV) {
  case "development":
    console.log("Environment is development");
    dotenv.config({
      path: resolve(__dirname, "../.env.development"),
    });
    break;
  case "test":
    console.log("Environment is test");
    dotenv.config({
      path: resolve(__dirname, "../.env.test"),
    });

    break;
  default:
    throw new Error(`NODE_ENV ${process.env.NODE_ENV} is not handled!`);
}
