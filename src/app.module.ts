import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';
import { Web3Module } from './web3/web3.module';

@Module({
  imports: [
    AuthModule,
    Web3Module,
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      extraProviders: [],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        password: configService.get('REDIS_PASSWORD'),
        username: configService.get('REDIS_USERNAME'),
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get(
          'REDIS_PORT',
        )}`,
        store: redisStore,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
