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
      valid: true,
    });
  });

  it("should validate with minimum fields ", () => {
    const user: User = {
      name: "Adrian",
      email: "quatre29@email.com",
      username: "quatre29",
      password: "qawsed",
    };

    const validation = validateUserSchema(user);

    expect(validation).toEqual({
      valid: true,
    });
  });

  it("should not validate without password", () => {
    const user = {
      name: "Adrian",
      email: "quatre29@email.com",
      username: "quatre29",
    };

    const validation = validateUserSchema(user);

    expect(validation).toEqual({ valid: false, msg: '"password" is required' });
  });
});
