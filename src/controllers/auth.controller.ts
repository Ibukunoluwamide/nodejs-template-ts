import { CREATED, OK } from "../constants/http";
import {
  createAccount,
  loginUser,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "../schemas/auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { user, accessToken } = await createAccount(request);
  
  // Return tokens in JSON response
  return res.status(CREATED).json({
    message: "User registered successfully",
    user,
    accessToken,
  });
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { accessToken} = await loginUser(request);

  // Return tokens in JSON response
  return res.status(OK).json({ 
    message: "Login successful",
    accessToken,
  });
});

export const logoutHandler = catchErrors(async (req, res) => {
  return res.status(OK).json({ message: "Logout successful" });
});


export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  return res.status(OK).json({ message: "Email was successfully verified" });
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  return res.status(OK).json({ message: "Password reset email sent" });
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  return res.status(OK).json({ message: "Password was reset successfully" });
});
