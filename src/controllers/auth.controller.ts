import { Request, Response, NextFunction } from "express";
import { ReturnedUser, User } from "../data-types/dataTypes";
import AppError from "../errors/AppError";
import crypto from "crypto";
import {
  selectUserByColumn,
  insertNewUser,
  returnAllUsers,
  removeUser,
} from "../models/users.model";
import {
  createPasswordResetToken,
  insertNewPassword,
  setPasswordResetTokenToNull,
} from "../models/auth.model";
import { validateUserSchema } from "../utils/validate";
import { validatePassword, encryptPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import sendEmail from "../utils/email";

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

const createAndSendToken = (user: User, status: number, res: Response) => {
  const token = signToken(user.user_id!);

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(status).send({ status: "success", data: { user }, token });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, name, avatar, password, email, location, role }: User =
      req.body;

    if (role && role.length > 0) {
      return next(
        new AppError("You are not allowed to sign up with a custom rank", 403)
      );
    }

    const validateUser = validateUserSchema(req.body);

    let userInput: User = {
      username,
      name,
      password,
      email,
      location,
    };

    let newUser: ReturnedUser = {} as ReturnedUser;

    if (validateUser.valid) {
      newUser = await insertNewUser(userInput);
    } else if (!validateUser.valid) {
      return next(new AppError(validateUser.msg!, 400));
    }

    createAndSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await selectUserByColumn(req.body.email, "email");

    if (!user) {
      return next(
        new AppError("There is no user with that email address", 404)
      );
    }

    const resetToken = await createPasswordResetToken(user.email);

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a new request with your new password and confirm it to: ${resetURL}. \nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).send({
        status: "success",
        message: "Token sent to email",
      });
    } catch (error) {
      await createPasswordResetToken(user.email, true);
      return next(
        new AppError(
          "There was an error sending the email. Try again later",
          500
        )
      );
    }
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await selectUserByColumn(hashedToken, "password_reset_token");

    const tokenExpireDate = user?.password_reset_expires.getTime();

    const tokenExpired: boolean = Date.now() > tokenExpireDate;

    if (!user || tokenExpired) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    const encryptedPassword = await encryptPassword(req.body.password);

    await insertNewPassword(user.email, encryptedPassword);
    await setPasswordResetTokenToNull(user.email);

    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validPassword = await validatePassword(
      req.body.current_password,
      req.user.password
    );

    if (!validPassword) {
      return next(new AppError("Your current password is wrong", 401));
    }

    const newPassword = await encryptPassword(req.body.new_password);

    const updatedUser = await insertNewPassword(req.user.email, newPassword);

    createAndSendToken(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError("Please provide username and password", 400));
    }

    const user = await selectUserByColumn(username, "username");

    if (!user || !(await validatePassword(password, user.password))) {
      return next(
        new AppError(
          "The username or password you entered did not match our records.Please double-check and try again",
          401
        )
      );
    }

    createAndSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------------

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};
