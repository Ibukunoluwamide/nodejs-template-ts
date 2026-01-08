# 📚 API Documentation

This project includes a comprehensive, interactive API documentation system built with Swagger UI and OpenAPI 3.0 specification.

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```


## 📖 Available Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `GET /auth/refresh` - Refresh access token
- `GET /auth/logout` - Logout and invalidate session
- `GET /auth/email/verify/:code` - Verify email address
- `POST /auth/password/forgot` - Send password reset email
- `POST /auth/password/reset` - Reset password with verification code

### User Management (`/user`)
- `GET /user` - Get current user profile (Protected)

### Session Management
- Not applicable. Authentication is stateless via JWT; no server-side sessions.

### Health Check
- `GET /` - Health check endpoint
`


**Happy API Testing! 🎉**
