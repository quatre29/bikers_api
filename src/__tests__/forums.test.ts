import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { User } from "../data-types/dataTypes";

beforeAll(() => seed(testData));
afterAll(() => db.end());

let authMemberToken = "";
let authAdminToken = "";

describe("Create users and get credentials", () => {
  //create member
  it("201: Creates a new member user", async () => {
    const newUser: User = {
      username: "quatre888",
      name: "Q E",
      email: "quatre888@email.com",
      password: "qawsed",
      location: "UK",
    };

    const { body } = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201);

    authMemberToken = body.token;
  });

  //create future admin
  it("201: Creates a new admin user", async () => {
    const newUser: User = {
      username: "quatre888Admin",
      name: "Q E A",
      email: "quatre888admin@email.com",
      password: "qawsed",
      location: "UK",
    };

    const { body } = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201);

    authAdminToken = body.token;
  });

  it("200: Promote member to admin", async () => {
    const roleBody = { role: "admin" };

    await request(app)
      .patch("/api/users/6/change_role")
      .set("Authorization", `Bearer ${authMemberToken}`)
      .send(roleBody)
      .expect(200);
  });
});
