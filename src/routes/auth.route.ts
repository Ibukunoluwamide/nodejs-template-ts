import { Router } from "express";
import {
  sendPasswordResetHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);

authRoutes.post("/login", loginHandler);

authRoutes.post("/logout", logoutHandler);

authRoutes.get("/email/verify/:code", verifyEmailHandler);

authRoutes.post("/password/forgot", sendPasswordResetHandler);

authRoutes.post("/password/reset", resetPasswordHandler);

export default authRoutes;
