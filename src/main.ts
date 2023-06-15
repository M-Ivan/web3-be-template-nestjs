import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { getAppVersion } from './common/helpers/configuration.helper';

async function bootstrap() {
  const expressAdapter: ExpressAdapter = new ExpressAdapter();
  const logger = new Logger(ExpressAdapter.name);

  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
      expressAdapter,
      {
        logger:
          process.env.APP_ENV === 'dev'
            ? ['error', 'warn', 'log', 'debug']
            : ['error', 'log'],
      },
    );

  app.enableCors({
    origin: process.env.APP_CORS_CLIENT_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200,
    credentials: true,
  });

  await app.listen(process.env.APP_PORT);
  logger.log(
    `Server listening on http(s)://localhost:${
      process.env.APP_PORT
    } - v${getAppVersion()}`,
  );
}
bootstrap();
