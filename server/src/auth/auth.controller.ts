import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const avatarsStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads', 'avatars');
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { username: string; password: string }, 
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body.username, body.password);
    this.setCookies(res, result.accessToken, result.refreshToken);
    
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarsStorage,
      limits: { fileSize: MAX_AVATAR_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
          return cb(new BadRequestException('Avatar must be jpg, png, webp or gif image') as Error, false);
        }
        cb(null, true);
      },
    }),
  )
  async register(
    @Body() body: { email: string; password: string; username: string },
    @UploadedFile() avatar: Express.Multer.File | undefined,
    @Res({ passthrough: true }) res: Response
  ) {
    const avatarPath = avatar ? `/uploads/avatars/${avatar.filename}` : undefined;
    const result = await this.authService.register(
      body.email,
      body.password,
      body.username,
      avatarPath,
    );
    this.setCookies(res, result.accessToken, result.refreshToken);
    
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }
  }
  
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token || body.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    this.setCookies(res, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
  
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return {
      message: 'Logged out successfully',
    };
  }
  
  @Post('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request) {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.authService.verifyAccessToken(accessToken);

    return {
      user,
    };
  }
}

