import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  continueWithGoogleUser,
  createAccount,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from "../services/auth.service";
import appAssert from "../utils/appAssert";
import { verifyToken } from "../utils/jwt";
import catchErrors from "../utils/catchErrors";
import {
  continueWithGoogleSchema,
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
  const { user, accessToken, refreshToken } = await createAccount(request);
  
  // Return tokens in JSON response
  return res.status(CREATED).json({
    message: "User registered successfully",
    user,
    accessToken,
    refreshToken,
  });
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { accessToken, refreshToken } = await loginUser(request);

  // Return tokens in JSON response
  return res.status(OK).json({ 
    message: "Login successful",
    accessToken,
    refreshToken,
  });
});
export const continueWithGoogleHandler = catchErrors(async (req, res) => {
  const request = continueWithGoogleSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  
  try {
    const { user, accessToken, refreshToken } = await continueWithGoogleUser(request);

    // Log successful Google authentication
    console.log(`Google authentication successful for user: ${user.email}`);

    // Return tokens in JSON response
    return res.status(OK).json({ 
      message: "Successfully signed in with Google",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    // Log failed Google authentication attempts
    console.error(`Google authentication failed: ${error.message}`, {
      userAgent: request.userAgent,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
});

export const logoutHandler = catchErrors(async (req, res) => {
  return res.status(OK).json({ message: "Logout successful" });
});

export const refreshHandler = catchErrors(async (req, res) => {
  // Accept refresh token from request body instead of cookies
  const { refreshToken } = req.body;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );
  
  // Return new tokens in JSON response
  return res.status(OK).json({ 
    message: "Access token refreshed",
    accessToken,
    refreshToken: newRefreshToken || refreshToken,
  });
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
