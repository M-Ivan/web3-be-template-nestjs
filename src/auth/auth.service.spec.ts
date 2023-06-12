import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('auth(service)', () => {
  let service: TestingModule;

  beforeAll(async () => {
    service = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();
  });

  // describe('getHello', () => );
});
