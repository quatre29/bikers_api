import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { User } from "../data-types/dataTypes";

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("POST /api/auth", () => {
  it("201: Creates a new user", async () => {
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

    expect(body.user).toEqual(
      expect.objectContaining({
        username: "quatre888",
        name: expect.any(String),
        role: "member",
        location: "UK",
        email: "quatre888@email.com",
        avatar: expect.any(String),
      })
    );
  });

  it("403: Crate a user with role field", async () => {
    const newUser: User = {
      username: "quatre888",
      name: "Q E",
      password: "qawsed",
      role: "admin",
    };

    await request(app).post("/api/users").send(newUser).expect(403);
  });
});
