import seed from "./seed";
import db from "../connection";
import devData from "../data/development-data/index";

const runSeed = async () => {
  await seed(devData);
  return await db.end();
};

runSeed();
