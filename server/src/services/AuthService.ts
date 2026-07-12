import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { HttpError } from '../errors/HttpError';
import { UserDocument } from '../models/interfaces';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';

export interface AuthResult {
  token: string;
  user: {
    id: unknown;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export class AuthService {
  private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(private readonly users: IUserRepository) {}

  private signToken(id: unknown): string {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  }

  private toAuthResult(user: UserDocument): AuthResult {
    return {
      token: this.signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    };
  }

  async register(name?: string, email?: string, password?: string): Promise<AuthResult> {
    if (!name || !email || !password)
      throw new HttpError(400, 'All fields are required');

    const existing = await this.users.findByEmail(email);
    if (existing) throw new HttpError(409, 'Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, password: hashed });

    return this.toAuthResult(user);
  }

  async login(email?: string, password?: string): Promise<AuthResult> {
    if (!email || !password)
      throw new HttpError(400, 'All fields are required');

    const user = await this.users.findByEmail(email);
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const match = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!match) throw new HttpError(401, 'Invalid credentials');

    return this.toAuthResult(user);
  }

  async googleLogin(credential?: string): Promise<AuthResult> {
    if (!credential) throw new HttpError(400, 'Missing credential');

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, 'Invalid Google credential');
    }
    if (!payload) throw new HttpError(401, 'Invalid Google credential');

    const { sub, email, name, picture } = payload;

    let user = await this.users.findByGoogleId(sub);
    if (!user && email) user = await this.users.findByEmail(email);

    if (user) {
      // Link the Google account to an existing email/password user.
      if (!user.googleId) {
        user.googleId = sub;
        user.avatar = user.avatar || picture || null;
        await user.save();
      }
    } else {
      user = await this.users.create({
        name,
        email,
        googleId: sub,
        avatar: picture ?? null,
      });
    }

    return this.toAuthResult(user);
  }

  /**
   * Verify a JWT and load its user (without the password field).
   * Throws on an invalid/expired token; resolves null for a deleted user.
   */
  async getUserFromToken(token: string): Promise<UserDocument | null> {
    const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return this.users.findByIdWithoutPassword(id);
  }
}
