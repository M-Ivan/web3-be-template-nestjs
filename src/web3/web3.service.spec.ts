import { Test, TestingModule } from '@nestjs/testing';
import { mockFactory } from '../../test/mock/mockFactory.helper';
import { ContractsEnum } from './enum/contracts.enum';
import { WalletsEnum } from './enum/wallets.enum';
import { Web3Service } from './web3.service';

describe('web3(service)', () => {
  let service: Web3Service;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [Web3Service],
    }).compile();

    service = module.get<Web3Service>(Web3Service);
  });

  it('Should approve token transfer', async () => {
    const fakeContract = mockFactory().classes().Contract;

    const fakeGetContract = jest
      .spyOn(service, 'getContract')
      .mockImplementationOnce(() => fakeContract);

    await service.approveTokenTransfer(
      WalletsEnum.Wallet1,
      WalletsEnum.Wallet2,
      ContractsEnum.MockERC721,
      1,
    );

    expect(fakeGetContract).toBeCalledWith(
      ContractsEnum.MockERC721,
      WalletsEnum.Wallet1,
    );
    expect(fakeContract.approve).toBeCalled();
  });
});
