import { validateUserSchema } from "../utils/validate";
import { User } from "../data-types/dataTypes";

describe("userSchema validation", () => {
  it("validate a user", () => {
    const user: User = {
      name: "Adrian B",
      password: "qawsed",
      username: "quatre29",
      email: "quatre29@email.com",
      location: "UK",
      role: "admin",
    };

    const validation = validateUserSchema(user);

    expect(validation).toEqual({
      value: {
        name: "Adrian B",
        password: "qawsed",
        username: "quatre29",
        email: "quatre29@email.com",
        location: "UK",
        role: "admin",
      },
    });
  });

  it("should validate with minimum fields ", () => {
    const user: User = {
      name: "Adrian",
      username: "quatre29",
      password: "qawsed",
    };

    const validation = validateUserSchema(user);

    expect(validation).toEqual({
      value: {
        name: "Adrian",
        username: "quatre29",
        password: "qawsed",
      },
    });
  });
});
