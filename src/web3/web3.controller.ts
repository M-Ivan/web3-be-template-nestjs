import { Controller, Get, Param } from '@nestjs/common';
import { ContractsEnum } from './enum/contracts.enum';
import { Web3Service } from './web3.service';

@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}

  @Get('balance/address/:address/token/:tokenContract/erc20')
  async getBalanceOfTokenInAddress(
    @Param('address') address: string,
    @Param('tokenContract') contract: ContractsEnum,
  ) {
    return this.web3Service.getBalanceOfTokenInAddress(address, contract);
  }

  @Get('balance/address/:address/token/:tokenContract/erc721')
  async getTokenIdsForAddress(
    @Param('address') address: string,
    @Param('tokenContract') contract: ContractsEnum,
  ) {
    return this.web3Service.getTokenIdsForAddress(address, contract);
  }
}
