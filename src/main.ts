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

  await app.listen(process.env.APP_PORT);
  logger.log(
    `Server listening on http(s)://localhost:${
      process.env.APP_PORT
    } - v${getAppVersion()}`,
  );
}
bootstrap();
