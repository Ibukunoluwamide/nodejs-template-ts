import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import connectToDatabase from "./config/db";
import errorHandler from "./middleware/errorHandler";
import authenticate from "./middleware/authenticate";
import { protectApiDocs, apiDocsCors } from "./middleware/apiDocs";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
// import sessionRoutes from "./routes/session.route";
import { swaggerSpec } from "./config/swagger";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";

const app = express();

// add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 */
app.get("/", (_, res) => {
  return res.status(200).json({
    status: "healthy",
  });
});

// API Documentation
const customCss = fs.readFileSync(path.join(__dirname, 'styles', 'swagger-theme.css'), 'utf8');

app.use("/api-docs", apiDocsCors, protectApiDocs, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: customCss,
  customSiteTitle: "Backend API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add any custom request headers or modifications here
      console.log('API Request:', req.method, req.url);
      return req;
    },
    responseInterceptor: (res: any) => {
      // Add any custom response handling here
      console.log('API Response:', res.status);
      return res;
    },
  },
}));

// auth routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);
// app.use("/sessions", authenticate, sessionRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
