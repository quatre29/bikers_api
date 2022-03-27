import db from "../db/connection";
import crypto from "crypto";

//---------------------------------------------------------------------------

export const changedPasswordAfter = (
  JWTTimestamp: number,
  passChangedAt: Date
): boolean => {
  if (passChangedAt) {
    const changedTimestamp = +(passChangedAt.getTime() / 1000).toFixed();

    return JWTTimestamp < changedTimestamp;
  }

  //password not changed
  return false;
};

//---------------------------------------------------------------------------

export const setPasswordResetTokenToNull = async (email: string) => {
  await db.query(
    `
            UPDATE users
            SET
            password_reset_token = null,
            password_reset_expires = null
            WHERE email = $1
            RETURNING password_reset_token, password_reset_expires
          `,
    [email]
  );
};

//---------------------------------------------------------------------------

export const createPasswordResetToken = async (
  user_email: string,
  setTokenToNull?: boolean
) => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const token = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiringTokenDate = Date.now() + 10 * 60 * 1000;

  await db.query(
    `
        UPDATE users
        SET
        password_reset_token = $1,
        password_reset_expires = to_timestamp($2 / 1000.0)
        WHERE email = $3
        RETURNING password_reset_token, password_reset_expires
      `,
    [token, expiringTokenDate, user_email]
  );

  if (setTokenToNull) {
    await setPasswordResetTokenToNull(user_email);
  }

  return resetToken;
};

//---------------------------------------------------------------------------

export const insertNewPassword = async (email: string, password: string) => {
  const user = await db.query(
    `
    UPDATE users
    SET 
    password_changed_at = to_timestamp($1 / 1000.0),
    password = $2
    WHERE email = $3
    RETURNING *;
    `,
    [Date.now() - 1000, password, email]
  );

  return user.rows[0];
};

//---------------------------------------------------------------------------
