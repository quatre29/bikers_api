import testData from "../db/data/testData";
import seed from "../db/seeds/seed";
import request from "supertest";
import app from "../app";
import db from "../db/connection";
import { LoginCredentials, User } from "../data-types/dataTypes";

beforeAll(() => seed(testData));
afterAll(() => db.end());

let authToken = "";

describe("Name of the Create and log in User", () => {
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
});

describe("POST /api/blog-posts/:post_id/comments", () => {
  it("201: Posting a new comment to blog post", async () => {
    const newComment = { body: "NEW COMMENT!" };

    const { body } = await request(app)
      .post("/api/blog-posts/2/comments")
      .send(newComment)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201);

    expect(body.data.comment).toEqual(
      expect.objectContaining({
        comment_id: expect.any(String),
        author: "quatre888",
        post_id: expect.any(String),
        edited: false,
        body: "NEW COMMENT!",
      })
    );
  });

  it("404: Posting a comment on a non-existent blog post", async () => {
    const newComment = { body: "NEW COMMENT!" };

    await request(app)
      .post("/api/blog-posts/222/comments")
      .send(newComment)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("400: Posting a comment w/o a body", async () => {
    await request(app)
      .post("/api/blog-posts/222/comments")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("400: Posting a comment w/o a body property", async () => {
    const newComment = {};

    await request(app)
      .post("/api/blog-posts/222/comments")
      .send(newComment)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });
});

describe("PATCH /api/blog-posts/:post_id/comments/:comment_id", () => {
  it("200: Edit an existing comment", async () => {
    const newComment = { body: "NEW COMMENT!" };

    const { body } = await request(app)
      .post("/api/blog-posts/2/comments")
      .send(newComment)
      .set("Authorization", `Bearer ${authToken}`);

    expect(body.data.comment.body).toBe("NEW COMMENT!");

    const comment_id = body.data.comment.comment_id;
    const commentUpdate = { body: "edited comment" };

    const {
      body: { data },
    } = await request(app)
      .patch(`/api/blog-posts/2/comments/${comment_id}`)
      .send(commentUpdate)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(data.comment.body).toBe("edited comment");
  });

  it("404: Edit a comment on a non-existent post", async () => {
    const commentUpdate = { body: "edited comment" };

    await request(app)
      .patch(`/api/blog-posts/222/comments/8`)
      .send(commentUpdate)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("404: Edit a non-existent comment", async () => {
    const commentUpdate = { body: "edited comment" };

    await request(app)
      .patch(`/api/blog-posts/2/comments/88`)
      .send(commentUpdate)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("400: Edit an existing comment with no body", async () => {
    await request(app)
      .patch(`/api/blog-posts/2/comments/8`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);
  });

  it("404: Edit am existing comment on a different post", async () => {
    const commentUpdate = { body: "edited comment" };

    await request(app)
      .patch(`/api/blog-posts/1/comments/8`)
      .send(commentUpdate)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });
});

describe("DELETE /api/blog-posts/:post_id/comments/:comment_id", () => {
  it("404: Delete an existing comment from an different post", async () => {
    await request(app)
      .delete(`/api/blog-posts/1/comments/8`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("404: Delete an existing comment from an non-existing post", async () => {
    await request(app)
      .delete(`/api/blog-posts/122/comments/8`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("404: Delete a non-existing comment", async () => {
    await request(app)
      .delete(`/api/blog-posts/2/comments/888`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  it("204: Delete my own comment", async () => {
    await request(app)
      .delete(`/api/blog-posts/2/comments/8`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);
  });

  it("400: Members cannot delete other's comments", async () => {
    await request(app)
      .delete(`/api/blog-posts/2/comments/3`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(401);
  });
});

describe("GET /api/blog-posts/:post_id/comments", () => {
  it("200: Get all the comments from the blog post", async () => {
    const { body } = await request(app)
      .get(`/api/blog-posts/2/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    body.data.comments.forEach((comment: any) => {
      expect(comment.post_id).toBe("2");
    });
  });

  it("404: get comments from a non-existing post", async () => {
    await request(app)
      .get(`/api/blog-posts/222/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });
});
