import swaggerJsdoc from 'swagger-jsdoc';
import { APP_ORIGIN } from '../constants/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API Documentation',
      version: '1.0.0',
      description: 'A comprehensive API documentation for the backend service with authentication, user management, and session handling.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: APP_ORIGIN || 'http://localhost:4004',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT access token stored in HTTP-only cookie. This is automatically handled by the browser.',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for API authentication. Use this format: Bearer <your-token>',
        },
        refreshTokenAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'JWT refresh token stored in HTTP-only cookie. Used for token refresh.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique user identifier',
              example: '507f1f77bcf86cd799439011',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            provider: {
              type: 'string',
              enum: ['manual', 'google'],
              description: 'Authentication provider',
              example: 'manual',
            },
            googleId: {
              type: 'string',
              description: 'Google user ID (if authenticated via Google)',
              example: '1234567890',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              description: 'User profile image URL',
              example: 'https://example.com/profile.jpg',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'User gender',
              example: 'other',
            },
            nationality: {
              type: 'string',
              nullable: true,
              description: 'User nationality',
              example: 'US',
            },
            language: {
              type: 'string',
              nullable: true,
              description: 'User primary language',
              example: 'en',
            },
            languageToLearn: {
              type: 'string',
              nullable: true,
              description: 'Language user wants to learn',
              example: 'es',
            },
            type: {
              type: 'string',
              enum: ['user', 'tutor', 'admin'],
              description: 'User type',
              example: 'user',
            },
            isAdmin: {
              type: 'boolean',
              description: 'Whether user is an admin',
              example: false,
            },
            accountStatus: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'Account status',
              example: 'active',
            },
            verified: {
              type: 'boolean',
              description: 'Whether email is verified',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique session identifier',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              description: 'User ID associated with session',
              example: '507f1f77bcf86cd799439011',
            },
            userAgent: {
              type: 'string',
              description: 'User agent string',
              example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Session creation timestamp',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Session expiration timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid email or password',
            },
            code: {
              type: 'string',
              description: 'Error code',
              example: 'INVALID_CREDENTIALS',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully',
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
