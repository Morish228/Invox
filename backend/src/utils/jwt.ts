//@types/jsonwebtoken tells TypeScript what functions exist in the library, what inputs they take, what outputs they return, allowing VS Code autocomplete, type checking, and compile-time error detection.
import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: "7d",
  };
console.log(process.env.JWT_SECRET)
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "default_secret",
    options
  );
};