# 📚 API Documentation

This project includes a comprehensive, interactive API documentation system built with Swagger UI and OpenAPI 3.0 specification.

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the API documentation:**
   - Open your browser and navigate to: `http://localhost:4004/api-docs`
   - The documentation interface will load with all available endpoints

## 📋 Features

### ✨ Interactive Documentation
- **Live API Testing**: Test endpoints directly from the documentation interface
- **Request/Response Examples**: See real examples for all endpoints
- **Authentication Support**: Built-in support for cookie-based and Bearer token authentication
- **Filter & Search**: Quickly find specific endpoints using the built-in filter

### 🎨 Custom Branding
- **Modern Design**: Clean, professional interface with custom styling
- **Dark Mode Support**: Automatically adapts to user's system preferences
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Custom Color Scheme**: Branded colors and typography

### 🔐 Security Features
- **Production Protection**: Optional middleware to restrict access in production
- **CORS Support**: Proper CORS headers for cross-origin requests
- **Authentication Examples**: Clear examples of how to authenticate with the API

## 📖 Available Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/google` - Continue with Google authentication
- `GET /auth/refresh` - Refresh access token
- `GET /auth/logout` - Logout and invalidate session
- `GET /auth/email/verify/:code` - Verify email address
- `POST /auth/password/forgot` - Send password reset email
- `POST /auth/password/reset` - Reset password with verification code

### User Management (`/user`)
- `GET /user` - Get current user profile (Protected)

### Session Management (`/sessions`)
- `GET /sessions` - Get all active sessions (Protected)
- `DELETE /sessions/:id` - Delete a specific session (Protected)

### Health Check
- `GET /` - Health check endpoint

## 🔑 Authentication

The API supports multiple authentication methods:

### Cookie Authentication (Recommended)
- Access and refresh tokens are automatically stored in HTTP-only cookies
- No manual token management required
- Automatically handled by the browser

### Bearer Token Authentication
- For API clients that prefer token-based authentication
- Format: `Authorization: Bearer <your-token>`

## 🛠️ Development

### Adding New Endpoints

1. **Add Swagger JSDoc comments** to your route files:
   ```typescript
   /**
    * @swagger
    * /your-endpoint:
    *   post:
    *     summary: Your endpoint description
    *     tags: [YourTag]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               field:
    *                 type: string
    *                 example: value
    *     responses:
    *       200:
    *         description: Success response
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/YourSchema'
    */
   ```

2. **Update schemas** in `src/config/swagger.ts` if needed

3. **Restart the server** to see changes

### Customizing the Theme

Edit `src/styles/swagger-theme.css` to customize:
- Colors and branding
- Typography
- Layout and spacing
- Dark mode styles

### Environment Configuration

Add these environment variables for production:

```bash
# Optional: Admin key for protecting API docs in production
ADMIN_API_KEY=your_admin_key_here

# Google OAuth (if using Google authentication)
GOOGLE_CLIENT_ID=your_google_client_id
```

## 🔒 Security Considerations

- **Development**: API docs are accessible to everyone
- **Production**: Consider adding additional protection:
  - IP whitelisting
  - Admin authentication
  - VPN-only access

## 📁 File Structure

```
src/
├── config/
│   └── swagger.ts          # OpenAPI specification
├── middleware/
│   └── apiDocs.ts          # Documentation protection middleware
├── routes/
│   ├── auth.route.ts       # Authentication endpoints
│   ├── user.route.ts       # User management endpoints
│   └── session.route.ts    # Session management endpoints
├── styles/
│   └── swagger-theme.css   # Custom CSS theme
└── index.ts                # Main server file with Swagger setup
```

## 🎯 Best Practices

1. **Keep Documentation Updated**: Update Swagger comments when changing endpoints
2. **Use Descriptive Examples**: Provide realistic example values
3. **Group Related Endpoints**: Use consistent tags for organization
4. **Document Error Responses**: Include all possible error scenarios
5. **Test Regularly**: Use the interactive interface to test your endpoints

## 🚀 Deployment

The API documentation is automatically included when you deploy your backend. Simply ensure:

1. All dependencies are installed
2. Environment variables are configured
3. The `/api-docs` route is accessible

## 📞 Support

For questions or issues with the API documentation:

1. Check the Swagger UI interface for interactive testing
2. Review the OpenAPI specification in `src/config/swagger.ts`
3. Test endpoints using the built-in "Try it out" functionality

---

**Happy API Testing! 🎉**
