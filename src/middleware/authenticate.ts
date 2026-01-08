import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";
import User from "../models/user.model";

const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  appAssert(
    authHeader && authHeader.startsWith("Bearer "),
    UNAUTHORIZED,
    "Authorization header with Bearer token required",
    AppErrorCode.InvalidAccessToken
  );

  const accessToken = authHeader.substring(7);

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  const user = await User.findById(payload.userId).select("_id role");

  appAssert(
    user,
    UNAUTHORIZED,
    "User no longer exists",
    AppErrorCode.InvalidAccessToken
  );

  req.userId = user._id.toString();
  req.role = user.role;

  next();
};

export default authenticate;
