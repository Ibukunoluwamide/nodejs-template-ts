"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const env_1 = require("./constants/env");
const app = (0, express_1.default)();
// add middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.get("/", (_, res) => {
    return res.status(200).json({
        status: "healthy",
    });
});
// auth routes
app.use("/auth", auth_route_1.default);
// protected routes
app.use("/user", authenticate_1.default, user_route_1.default);
// error handler
app.use(errorHandler_1.default);
app.listen(env_1.PORT, async () => {
    console.log(`Server listening on port ${env_1.PORT} in ${env_1.NODE_ENV} environment`);
    await (0, db_1.default)();
});
