import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getAppVersion } from './common/helpers/configuration.helper';

describe('app(controller)', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getVersion', () => {
    it('should return server version', () => {
      const appService = app.get(AppService);
      expect(appService.getVersion()).toBe(getAppVersion());
    });
  });
});
