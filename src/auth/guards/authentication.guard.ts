import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as cookie from 'cookie';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthenticationGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      const sessionId = this.authService.extractSessionId(request);
      if (!sessionId) {
        throw new HttpException(
          {
            code: 'unauthenticated',
            message: `Unauthorized access`,
            statusText: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const authSession = await this.authService.getAuthSession(sessionId);
      if (!authSession) {
        throw new HttpException(
          {
            code: 'invalid_session',
            message: `Invalid session`,
            statusText: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Refresh session
      await this.authService.setAuthSession(authSession.sessionId, authSession);

      request.user = {
        ...authSession,
      };

      // Refresh cookie and return it
      response.setHeader(
        'Set-Cookie',
        cookie.serialize(
          'sessionId',
          sessionId,
          this.authService.getAuthCookieOptions(),
        ),
      );
      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
