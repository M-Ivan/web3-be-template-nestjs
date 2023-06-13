import { Controller, Get, Param } from '@nestjs/common';
import { ContractsEnum } from './enum/contracts.enum';
import { TokenStandardEnum } from './enum/tokenStandard.enum';
import { Web3Service } from './web3.service';

@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}

  @Get('balance/address/:address/token/:tokenContract/:standard')
  async getBalanceOfTokenInAddress(
    @Param('address') address: string,
    @Param('tokenContract') contract: ContractsEnum,
    @Param('standard') standard: TokenStandardEnum,
  ) {
    return this.web3Service.balanceOf(address, contract, standard);
  }
}
