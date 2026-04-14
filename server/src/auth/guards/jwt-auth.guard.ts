import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const cookieToken = request.cookies?.access_token;

		if (cookieToken) {
			request.headers.authorization = `Bearer ${cookieToken}`;
		}

		return super.canActivate(context);
	}
}

