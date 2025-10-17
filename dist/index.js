"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const apiDocs_1 = require("./middleware/apiDocs");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const session_route_1 = __importDefault(require("./routes/session.route"));
const swagger_1 = require("./config/swagger");
const env_1 = require("./constants/env");
const app = (0, express_1.default)();
// add middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
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
const customCss = fs_1.default.readFileSync(path_1.default.join(__dirname, 'styles', 'swagger-theme.css'), 'utf8');
app.use("/api-docs", apiDocs_1.apiDocsCors, apiDocs_1.protectApiDocs, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
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
        requestInterceptor: (req) => {
            // Add any custom request headers or modifications here
            console.log('API Request:', req.method, req.url);
            return req;
        },
        responseInterceptor: (res) => {
            // Add any custom response handling here
            console.log('API Response:', res.status);
            return res;
        },
    },
}));
// auth routes
app.use("/auth", auth_route_1.default);
// protected routes
app.use("/user", authenticate_1.default, user_route_1.default);
app.use("/sessions", authenticate_1.default, session_route_1.default);
// error handler
app.use(errorHandler_1.default);
app.listen(env_1.PORT, async () => {
    console.log(`Server listening on port ${env_1.PORT} in ${env_1.NODE_ENV} environment`);
    await (0, db_1.default)();
});
