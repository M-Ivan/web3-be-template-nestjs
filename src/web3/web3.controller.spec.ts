import { Test, TestingModule } from '@nestjs/testing';
import { Web3Controller } from './web3.controller';

describe('web3(controller)', () => {
  let controller: Web3Controller;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [Web3Controller],
      providers: [],
    }).compile();

    controller = module.get<Web3Controller>(Web3Controller);
  });

  // describe('getHello', () => );
});
