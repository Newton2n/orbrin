import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const verifyToken = (token: string, secretKey: string) => {
  try {
    const verify = jwt.verify(token, secretKey);

    return {
      success: true,
      data: verify as JwtPayload,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
};
export const jwtUtils = { verifyToken };
