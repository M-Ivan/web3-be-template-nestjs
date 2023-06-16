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
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly web3Service: Web3Service,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * @method generateNonce
   * Generates and stores a nonce for security reassons
   * @returns {string} generated nonce
   */
  async generateNonce(): Promise<string> {
    try {
      const nonce = generateNonce();
      await this.cacheManager.set(`NONCE_${nonce}`, nonce, 300 * 1000);

      return nonce;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

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
      const nonce = await this.cacheManager.get(`NONCE_${input.nonce}`);

      if (!nonce) {
        throw new HttpException(
          {
            code: 'invalid_nonce',
            message: `The nonce you provided is invalid or expired`,
            statusText: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const siweMessage = new SiweMessage(input.msg);
      const verifyResult = await siweMessage.verify({
        signature: input.sig,
        nonce: input.nonce,
      });

      if (!verifyResult.success) {
        throw new HttpException(
          {
            code: 'invalid_signature',
            message: `The signature you provided does not match the message`,
            statusText: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { data: message } = verifyResult;

      const sessionId = uuid();

      const session = new AuthSession();
      session.address = message.address;
      session.chainId = message.chainId;
      session.domain = message.domain;
      session.expirationTime = message.expirationTime;
      session.issuedAt = message.issuedAt;
      session.nonce = message.nonce;
      session.notBefore = message.notBefore;
      session.requestId = message.requestId;
      session.resources = message.resources;
      session.statement = message.statement;
      session.uri = message.uri;
      session.version = message.version;

      await this.setAuthSession(sessionId, session);
      await this.cacheManager.del(`NONCE_${input.nonce}`);

      return { sessionId };
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

      data.sessionExpires = Date.now() + maxAgeMs; // Expiration date in Unix timestamp
      data.sessionId = sessionId;

      // Do whatever with your auth session here

      await this.cacheManager.set(key, data, maxAgeMs);

      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async logoutUser(sessionId: string): Promise<void> {
    try {
      await this.cacheManager.del(`AUTH_SESSION_${sessionId}`);
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
