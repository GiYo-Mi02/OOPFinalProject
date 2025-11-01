import request from 'supertest';
import express, { Application, Request } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthClaims } from '../src/middleware/authenticate';
import { env } from '../src/config/env';

describe('JWT Authentication Middleware', () => {
  let app: Application;
  const SECRET = env.APP_JWT_SECRET;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Protected route
    app.get('/protected', authenticate, (req, res) => {
      const auth = (req as Request & { auth?: AuthClaims }).auth;
      res.json({ 
        message: 'Access granted',
        user: auth 
      });
    });

    // Public route
    app.get('/public', (req, res) => {
      res.json({ message: 'Public access' });
    });
  });

  describe('Valid JWT Token', () => {
    it('should allow access with valid token', async () => {
      const payload = {
        sub: 'test-user-123',
        email: 'test@umak.edu.ph',
        role: 'student',
      };

      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
      expect(response.body.user).toMatchObject({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    });

    it('should accept token with different roles', async () => {
      const adminPayload = {
        sub: 'admin-123',
        email: 'admin@umak.edu.ph',
        role: 'admin',
      };

      const token = jwt.sign(adminPayload, SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('admin');
    });
  });

  describe('Invalid JWT Token', () => {
    it('should reject request without authorization header', async () => {
      const response = await request(app).get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authorization token missing');
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authorization token missing');
    });

    it('should reject invalid token signature', async () => {
      const token = jwt.sign(
        { sub: 'test', email: 'test@umak.edu.ph' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should reject expired token', async () => {
      const token = jwt.sign(
        { sub: 'test', email: 'test@umak.edu.ph' },
        SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should reject completely invalid token string', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('Token Format Variations', () => {
    it('should accept Bearer token with proper case', async () => {
      const token = jwt.sign(
        { sub: 'test', email: 'test@umak.edu.ph' },
        SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should handle token with instituteId', async () => {
      const token = jwt.sign(
        { sub: 'test', email: 'test@umak.edu.ph', role: 'student', instituteId: 'ccis' },
        SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.instituteId).toBe('ccis');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without token', async () => {
      const response = await request(app).get('/public');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Public access');
    });
  });
});
