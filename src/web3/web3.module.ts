import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [Web3Controller],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
