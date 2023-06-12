import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('auth(controller)', () => {
  let controller: TestingModule;

  beforeAll(async () => {
    controller = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();
  });

  // describe('getHello', () => );
});
