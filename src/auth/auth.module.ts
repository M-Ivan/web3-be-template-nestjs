import { forwardRef, Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticationGuard } from './guards/authentication.guard';

@Module({
  imports: [forwardRef(() => Web3Module)],
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard],
  exports: [AuthService],
})
export class AuthModule {}
