import { createHash } from 'crypto';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../index.js';

// Simple in-memory user store (replace with DB)
let users = [];

const hashPassword = (password) => createHash('sha256').update(password).digest('hex');

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'maxim-secret-dev';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24h
  })).toString('base64url');
  const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
};

export const verifyToken = (token) => {
  try {
    const [header, payload, sig] = token.split('.');
    const secret = process.env.JWT_SECRET || 'maxim-secret-dev';
    const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
};

class AuthController {
  register = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = {
      id: uuidv4(),
      username,
      email,
      password: hashPassword(password),
      role: users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    logger.info(`User registered: ${email}`);

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  };

  login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user.id);
    logger.info(`User logged in: ${email}`);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  };

  getMe = (req, res) => {
    const user = users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  };
}

export default new AuthController();
