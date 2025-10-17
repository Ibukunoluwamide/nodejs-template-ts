import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = (req, res, next) => {
  // Extract token from Authorization header (Bearer token format)
  const authHeader = req.headers.authorization;
  
  appAssert(
    authHeader && authHeader.startsWith("Bearer "),
    UNAUTHORIZED,
    "Authorization header with Bearer token required",
    AppErrorCode.InvalidAccessToken
  );

  // Extract the token after "Bearer "
  const accessToken = authHeader.substring(7);
  
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  next();
};

export default authenticate;
