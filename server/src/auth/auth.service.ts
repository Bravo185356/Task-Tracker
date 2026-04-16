import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

export interface TokenPayload {
  username: string;
  sub: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findUserByLoginCredential(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m', // Access token - короткий
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'), // Другой секрет!
      expiresIn: '7d', // Refresh token - длинный
    });

    return { accessToken, refreshToken };
  }
  
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    const tokens = this.generateTokens(payload);
    return {
      user,
      ...tokens,
    };
  }

  async register(email: string, password: string, username: string) {
    const existingUser = await this.usersService.findExistingUser(email, username);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const user = await this.usersService.create(email, password, username);
    const { password: _, ...result } = user;

    const payload: TokenPayload = {
      username: user.username,
      sub: user.id,
    };
    const tokens = this.generateTokens(payload);
    return {
      user: result,
      ...tokens,
    };
  }
  
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password: _, ...result } = user;
      const payload: TokenPayload = { username: user.username, sub: user.id };
      const tokens = this.generateTokens(payload);

      return {
        user: result,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  async verifyAccessToken(accessToken: string) {
    try {
      const decoded = this.jwtService.verify<TokenPayload>(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
  
  async tokenAuth(token: string) {
    const decoded = this.jwtService.verify(token);
    const user = await this.usersService.findById(decoded.sub);
    
    const { password: _, ...result } = user;
    return {
      user: result,
      access_token: token,
    };
  }
}

