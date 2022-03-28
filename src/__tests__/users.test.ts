import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { LoginCredentials, User } from "../data-types/dataTypes";

beforeAll(() => seed(testData));
afterAll(() => db.end());

describe("POST /api/users", () => {
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

    expect(body.data.user).toEqual(
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
      email: "quatre888@email.com",
      password: "qawsed",
      role: "admin",
    };

    await request(app).post("/api/users").send(newUser).expect(403);
  });

  it("400: Crate a user without password field", async () => {
    const newUser = {
      username: "quatre888",
      name: "Q E",
    };

    const { body } = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400);
  });
});

describe("POST /api/users/login", () => {
  it("200: Login with valid credentials", async () => {
    const newUser: LoginCredentials = {
      username: "quatre888",
      password: "qawsed",
    };

    await request(app).post("/api/users/login").send(newUser).expect(200);
  });
  it("400: Error when not providing all fields required", async () => {
    const newUser = {
      username: "quatre888",
    };

    await request(app).post("/api/users/login").send(newUser).expect(400);
  });
  it("401: Login with wrong credentials", async () => {
    const newUser: LoginCredentials = {
      username: "quatre888",
      password: "wrongpassword",
    };

    await request(app).post("/api/users/login").send(newUser).expect(401);
  });
});
