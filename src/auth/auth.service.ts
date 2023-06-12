import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Web3Service } from '../web3/web3.service';
import { LoginInput } from './dto/loginInput.dto';
import { LoginOutput } from './dto/loginOutput.dto';
import { AuthSession } from './dto/authSession.dto';
import { Request } from 'express';
import * as cookie from 'cookie';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly web3Service: Web3Service) {}

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
        throw new UnauthorizedException();
      }

      const authSession = new AuthSession();
      authSession.address = input.address;

      const sessionId = uuid();

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

      //  const redisFetch: string = await this.cacheManager.get(key);

      return JSON.parse('');
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
      data.expires =
        Date.now() + Number(process.env.APP_AUTH_LOGIN_EXPIRES_SECONDS) * 1000; // Expiration date in Unix timestamp

      data.sessionId = sessionId;

      // Do whatever with your auth session here

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
