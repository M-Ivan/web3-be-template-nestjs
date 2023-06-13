import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers, JsonRpcProvider } from 'ethers';
import { CallContractInput } from './dto/callContractInput.dto';
import { ContractsEnum } from './enum/contracts.enum';
import { ContractAbis } from './static/contractAbis.static';
import { BalanceOutput } from './dto/balanceOutput.dto';
import { getAppVersion } from '../common/helpers/configuration.helper';
import { TokenStandardEnum } from './enum/tokenStandard.enum';

@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name);
  private readonly web3Provider: JsonRpcProvider;
  constructor() {
    this.web3Provider = new ethers.JsonRpcProvider(process.env.WEB3_NODE_URL);

    this.logger.log(`Successfully connected to: ${process.env.WEB3_NODE_URL}`);
  }

  /**
   * @method getContract
   * Creates a Contract instance for the contract specified.
   * If wallet is specified (assuming the server has access to that wallet)
   * it uses that wallet as the Contract caller (write-access)
   *
   * @param {address} contractAddress contract address
   * @returns {Contract} Contract instance
   */
  getContract(contractAddress: string): Contract {
    const abi = this.getAbiForContract(contractAddress);

    this.logger.log(`Initializing contract ${contractAddress}`);
    return new Contract(contractAddress, abi, this.web3Provider);
  }

  /**
   * @method callContract
   * Creates a Contract instance for the contract specified and calls the
   * specified method with the given arguments.
   * If wallet is specified (assuming the server has access to that wallet)
   * it uses that wallet as the Contract caller (write-access)
   *
   * @param {CallContractInput} input operation data
   * @returns {any} whatever the contract replies
   */
  async callContract(input: CallContractInput): Promise<any> {
    try {
      const contract = this.getContract(input.contract);

      return await contract[input.method](...input.arguments);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * @method balanceOf
   *
   * @param {address} address to consult
   * @param {address} tokenContract to consult
   * @param {TokenStandardEnum} standard the token type
   * @returns {BalanceOutput} balance details
   */
  async balanceOf(
    address: string,
    tokenContract: string,
    standard: TokenStandardEnum,
  ): Promise<BalanceOutput> {
    try {
      switch (standard) {
        case TokenStandardEnum.ERC20:
          return await this.getBalanceOfTokenInAddress(address, tokenContract);
        case TokenStandardEnum.ERC721:
          return await this.getTokenIdsForAddress(address, tokenContract);
        default:
          throw new HttpException(
            {
              message: `Unknown token standard, received ${standard}`,
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              code: 'unknown_token_type',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * @method getBalanceOfTokenInAddress
   * Gets the total balance of tokens (ERC20 or ERC721) that an address has.
   *
   * @param {address} address address to check the balance of
   * @param {address} tokenContract the token to consult
   * @returns {BalanceOutput} balance details
   */
  private async getBalanceOfTokenInAddress(
    address: string,
    tokenContract: string,
  ): Promise<BalanceOutput> {
    try {
      const balance = await this.callContract({
        contract: tokenContract,
        method: 'balanceOf',
        arguments: [address],
      });

      return { amount: balance.toString(), address, tokenContract };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * @method getAbiForContract
   * Helper function that helps with the ABI management in code.
   *
   * @param {address} contract contract requiring the abi
   * @returns {JSON} json document
   */
  private getAbiForContract(contract: string): Record<string, unknown>[] {
    let abi: Record<string, unknown>[];

    switch (contract) {
      case ContractsEnum.EXAMPLE:
        abi = ContractAbis.Example;
        break;
      default:
        throw new HttpException(
          {
            message: `Contract ${contract} is not yet supported for processing on app version: ${getAppVersion()}`,
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            code: 'unknown_contract',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }

    return abi;
  }

  /**
   * @method getTokenIdsForAddress
   * Gets an address token ids in posession.
   *
   * @param {address} address address to consult
   * @param {address} tokenContract ERC721 contract
   * @returns {BalanceOutput} Balance output details.
   */
  private async getTokenIdsForAddress(
    address: string,
    tokenContract: string,
  ): Promise<BalanceOutput> {
    try {
      const tokenBalance = await this.getBalanceOfTokenInAddress(
        address,
        tokenContract,
      );

      const contract = this.getContract(tokenContract);

      const tokenIds: (string | number)[] = [];
      for (let i = 0; i < Number(tokenBalance.amount); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        tokenIds.push(Number(tokenId));
      }

      return {
        address,
        tokenContract,
        amount: tokenBalance.amount.toString(),
        tokenIds,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
