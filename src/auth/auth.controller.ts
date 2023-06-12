import { Body, Controller, Post, Res } from '@nestjs/common';
import { ethers } from 'ethers';
import { Response } from 'express';
import { Web3Service } from '../web3/web3.service';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/loginInput.dto';
import { LoginOutput } from './dto/loginOutput.dto';
import * as cookie from 'cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly web3Service: Web3Service,
  ) {}

  @Post('login')
  async loginUser(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginOutput> {
    const result = await this.authService.signIn(body);

    res.setHeader(
      'Set-Cookie',
      cookie.serialize(
        'sessionId',
        result.sessionId,
        this.authService.getAuthCookieOptions(),
      ),
    );

    return result;
  }
}
