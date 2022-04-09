import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { LoginCredentials, User } from "../data-types/dataTypes";

beforeAll(() => seed(testData));
afterAll(() => db.end());

let authToken = "";

describe("POST /api/blog-posts", () => {
  //login as member
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

    authToken = body.token;
  });

  it("201:  Creating a new blog post", async () => {
    const newPost = {
      title: "This is a blog title",
      body: "A bunch of text",
      tags: ["tag1", "tag2"],
    };

    const { body } = await request(app)
      .post("/api/blog-posts")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(newPost);

    expect(body.data.post).toEqual(
      expect.objectContaining({
        post_id: expect.any(String),
        title: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        tags: expect.any(Array),
      })
    );
  });

  it("400: create post with no title", async () => {
    const newPost = {
      body: "A bunch of text",
      tags: ["tag1", "tag2"],
    };

    await request(app)
      .post("/api/blog-posts")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(newPost);
  });

  it("400: create post with no tag as string and not inside an array", async () => {
    const newPost = {
      title: "This is a blog title",
      body: "A bunch of text",
      tags: "tag1",
    };

    await request(app)
      .post("/api/blog-posts")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(newPost);
  });

  it("400: create post with no body", async () => {
    await request(app)
      .post("/api/blog-posts")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);
  });
  it("401: create post with no auth token", async () => {
    const newPost = {
      title: "This is a blog title",
      body: "A bunch of text",
      tags: "tag1",
    };

    await request(app).post("/api/blog-posts").expect(401).send(newPost);
  });
});

describe("PATCH /api/blog-posts/:post_id/edit", () => {
  it("200: Updating a blog post with a new title", async () => {
    const updates = {
      title: "New Title!!!",
    };

    const { body } = await request(app)
      .patch("/api/blog-posts/3/edit")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .send(updates);

    expect(body.data.post.title).toBe("New Title!!!");
  });

  it("200: Updating a blog post with a new array of tags", async () => {
    const updates = {
      tags: ["newtag1", "newtag2"],
    };

    const { body } = await request(app)
      .patch("/api/blog-posts/3/edit")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .send(updates);

    expect(body.data.post.tags).toEqual(["newtag1", "newtag2"]);
  });

  it("400: Updating a blog post with a new tag as string", async () => {
    const updates = {
      tags: "tag1",
    };

    await request(app)
      .patch("/api/blog-posts/3/edit")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(updates);
  });

  it("401: Updating a blog post with a no auth token", async () => {
    const updates = {
      tags: "tag1",
    };

    await request(app)
      .patch("/api/blog-posts/3/edit")
      .expect(401)
      .send(updates);
  });

  it("404: Updating a blog post that doesn't exist", async () => {
    const updates = {
      tags: ["tag1"],
    };

    await request(app)
      .patch("/api/blog-posts/333/edit")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404)
      .send(updates);
  });
});

describe("POST api/blog-posts/:post_id/rating", () => {
  it("201: Rate a blog post with number", async () => {
    const rateBody = {
      rating: 5,
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("5");
  });

  it("201: Rate a blog post with string", async () => {
    const rateBody = {
      rating: "5",
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("5");
  });

  it("201: Rate a blog post with decimal string", async () => {
    const rateBody = {
      rating: "4.4",
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("4.4");
  });

  it("201: Rate a blog post with decimal number", async () => {
    const rateBody = {
      rating: 3.5,
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("3.5");
  });

  it("201: Rate a blog post with 2 decimal number", async () => {
    const rateBody = {
      rating: 3.56,
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("3.6");
  });

  it("201: Rate a blog post with 4 decimal number", async () => {
    const rateBody = {
      rating: "3.5666",
    };

    const { body } = await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201)
      .send(rateBody);

    expect(body.data.rating.rating).toBe("3.6");
  });

  it("400: Rate a blog post with rating > 5", async () => {
    const rateBody = {
      rating: 6,
    };

    await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(rateBody);
  });
  it("400: Rate a blog post with rating < 0.5", async () => {
    const rateBody = {
      rating: 0.3,
    };

    await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(rateBody);
  });
  it("400: Rate a blog post with rating < 0", async () => {
    const rateBody = {
      rating: -4,
    };

    await request(app)
      .post("/api/blog-posts/3/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
      .send(rateBody);
  });
  it("404: Rate a blog post that doesn't exist", async () => {
    const rateBody = {
      rating: 4.5,
    };

    await request(app)
      .post("/api/blog-posts/333/rating")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404)
      .send(rateBody);
  });
});
