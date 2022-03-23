import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";

describe("Name of the group", () => {
  it("404: Path not found", async () => {
    const { body } = await request(app).get("/unknown-path").expect(200);
    console.log(body, "==============");
  });
});
