import { RequestHandler } from "express";
import { FORBIDDEN } from "../constants/http";
import appAssert from "../utils/appAssert";

const authorize = (roles: Array<"user" | "admin">): RequestHandler => {
  return (req, res, next) => {

    appAssert(
      req.role && roles.includes(req.role),
      FORBIDDEN,
      "You do not have permission to access this resource",
    );

    next();
  };
};

export default authorize;
