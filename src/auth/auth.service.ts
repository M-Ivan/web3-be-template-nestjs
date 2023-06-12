import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Web3Service } from '../web3/web3.service';
import { LoginInput } from './dto/loginInput.dto';
import { LoginOutput } from './dto/loginOutput.dto';
import { AuthSession } from './dto/authSession.dto';
import { Request } from 'express';
import * as cookie from 'cookie';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly web3Service: Web3Service,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * @method signIn
   * Verifies a signed message checking if its really who claims to be.
   * If signatures match an AuthSession is created and stored, and a cookie with the session id is placed soon after
   *
   * @param {LoginInput} input login data
   * @returns {LoginOutput} session data
   */
  async signIn(input: LoginInput): Promise<LoginOutput> {
    try {
      const signerAddress = ethers.verifyMessage(input.msg, input.sig);

      if (signerAddress !== input.address) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED, // Status code. i.e 401
            message: `Message was not signed by address ${input.address}`, // Detail of the error
            code: 'invalid_signature', // App-scoped code for front-end error handling
          },
          HttpStatus.UNAUTHORIZED, // Res.statusCode
        );
      }

      const authSession = new AuthSession();
      authSession.address = input.address;

      const sessionId = uuid();

      await this.setAuthSession(sessionId, authSession);

      return { address: input.address, sessionId };
    } catch (e) {
      this.logger.error(e);

      throw e;
    }
  }

  /**
   * @method extractSessionId
   * Get sessionId from cookies in the request.
   *
   * @param  {Request} request Request object.
   * @return {string} sessionId.
   */
  extractSessionId(request: Request): string {
    const cookies = cookie.parse(request.headers.cookie || '');

    if (!cookies || !cookies['sessionId']) return null;

    return cookies['sessionId'];
  }

  /**
   * @method getAuthSession
   * Finds an auth session for the sessionId provided
   *
   * @param {string} sessionId Session uuid to search.
   * @return {AuthSession} auth session if successfull
   */
  async getAuthSession(sessionId: string): Promise<AuthSession> {
    try {
      const key = `AUTH_SESSION_${sessionId}`;

      const session = await this.cacheManager.get<AuthSession>(key);

      return session;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * @method setAuthSession
   * Stores an AuthSession with the details provided.
   * Sets the expiration to happen on specified value
   *
   * @param {string} sessionId Session uuid to cache.
   * @param {AuthSession} data Session data to cache.
   * @return {boolean} true if successfull
   */
  async setAuthSession(sessionId: string, data: AuthSession): Promise<boolean> {
    try {
      const key = `AUTH_SESSION_${sessionId}`;

      const maxAgeMs =
        Number(process.env.APP_AUTH_LOGIN_EXPIRES_SECONDS) * 1000;

      data.expires = Date.now() + maxAgeMs; // Expiration date in Unix timestamp
      data.sessionId = sessionId;

      // Do whatever with your auth session here

      await this.cacheManager.set(key, data, maxAgeMs);

      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * @method getAuthCookieOptions
   * Gets the cookie options for the cookies related to auth
   *
   * @returns {CookieOptions} cookie options
   */
  getAuthCookieOptions() {
    return {
      path: '/',
      secure: false,
      signed: false,
      httpOnly: true,
      maxAge: Number(process.env.APP_AUTH_LOGIN_EXPIRES_SECONDS) * 1000,
    };
  }
}
