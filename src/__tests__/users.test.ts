import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { LoginCredentials, User } from "../data-types/dataTypes";

beforeAll(() => seed(testData));
afterAll(() => db.end());

let authToken = "";

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

    const { body } = await request(app)
      .post("/api/users/login")
      .send(newUser)
      .expect(200);

    authToken = body.token;
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

describe("GET /api/users", () => {
  it("200: Get all the users without a token", async () => {
    await request(app).get("/api/users").expect(401);
  });
  it("200: Get all the users", async () => {
    await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
  });

  it("200: Get all the users with a specific location", async () => {
    const { body } = await request(app)
      .get("/api/users?location=Uk")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    body.data.users.forEach((user: User) => expect(user.location).toBe("UK"));
  });

  it("200: Get all the users with a specific role", async () => {
    const { body } = await request(app)
      .get("/api/users?role=admin")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    body.data.users.forEach((user: User) => expect(user.role).toBe("admin"));
  });
  it("200: Get all the users with multiple parameters (role & location)", async () => {
    const { body } = await request(app)
      .get("/api/users?role=admin&location=uk")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    body.data.users.forEach((user: User) => {
      expect(user.role).toBe("admin");
      expect(user.location).toBe("UK");
    });
  });

  it("404: when getting users with wrong parameters", async () => {
    await request(app)
      .get("/api/users?role=president")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("500: when getting users with no auth token", async () => {
    await request(app).get("/api/users").expect(401);
  });
});
