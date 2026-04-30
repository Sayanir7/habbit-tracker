import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d"
  });
