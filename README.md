<p align="center">
<img src="https://ethereum.org/static/810eb64d89629231aa4d8c7fe5f20ee5/69de1/developers-eth-blocks.webp" width="300" alt="Decentralization" />
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A template <a href="https://nestjs.com" target="_blank">NestJS</a> repository for building decentralized applications</p>

## Description

[Nest](https://github.com/nestjs/nest) web3 starter repository.

## Features

- Dockerized Redis
- Auth module
- Authenticate endpoint decorator for making endpoints private
- ReqUser param decorator for accessing the requester auth session (must be used along with Authenticate decorator)
- Web3 base module with helper methods and endpoints

## Documentation

- [Auth module](#auth-module)
- - [Login](#login)
- - [Authenticate decorator](#authenticate-route-decorator)
- - [Req.user decorator](#authenticate-route-decorator)
- [Web3 Module](#web3-module)
- - [Contract management](#contract-management)
- - [BalanceOf](#balanceof)
- - - [erc20 endpoint](#endpoint-details-erc20)
- - - [erc20 function](#balanceof-function-erc20)
- - - [erc721 endpoint](#endpoint-details-erc721)
- - - [erc721 function](#balanceof-function-erc721)

### Auth module

The auth module provides out of the box session management using Redis as the store for the Auth Sessions. This allows for endpoints to be private while keeping server instance stateless.

#### Login

The auth module provides a public endpoint to allow users perform login by doing signature validation.

- URL: [http://server/auth/login]()
- Verb: POST
- Body(application/json)

```json
{
  "sig": "foo",
  "address": "0x0etc",
  "msg": "msgHash"
}
```

Endpoint replies with a cookie `sessionId` with the id of the session in the redis cache instance. This session expires at the `.env` specified `APP_AUTH_LOGIN_EXPIRES_SECONDS` variable and will be validated on each request where the route is protected by the [`@Authenticate`](#authenticate-route-decorator)
decorator

#### Authenticate route decorator

The `@Authenticate` decorator is a custom helper decorator which simply protects the route by the `AuthenticationGuard`. The guard will verify the validity of the requester auth session.

Example usage:

```TypeScript
@Controller('sample')
export class SampleController {
  //...

  @Authenticate()
  @Get('my-protected-route')
  async onlyAuthenticated() {
    // Your private code
  }

  //...
}
```

#### ReqUser Param decorator

The `@ReqUser` decorator is a custom helper decorator which returns the request.user object which stores the auth session details of the requester. Only works in endpoints protected by the [`@Authenticate`](#authenticate-route-decorator) since the `AuthenticationGuard` is the entity that stores the requester info in the request.user property

Example usage:

```TypeScript
@Controller('sample')
export class SampleController {
  //...

  @Authenticate()
  @Get('my-protected-route')
  async onlyAuthenticated(@ReqUser() user: AuthSession) {
    console.log(user) // Session data
  }
  //...
}
```

### Web3 Module

The web3 module provides a set of out-of-the-box features and helpers for common use-cases when working in web3. It is also SOLID compliant.
You can take advantage of the [dependency-injection](https://docs.nestjs.com/fundamentals/custom-providers) Nest feature to make the web3 module methods available in your block of code.

#### Contract management

The web3 module provides a easy way handling contracts and abis. You can store the contract abi in the `web3/static/contractAbis.static.ts` file and access it later on the `getAbiForContract` helper function of the `web3.service.ts` file.
You should also list your app consumed contract addresses on the `contracts.enum.ts`

Finally, you should be able to access a contract instance using the `getContract` function

```TypeScript
  myMethod() {
    const contract = await this.web3Service
    .getContract('0x0SampleContract')

    // Call a contract method
    const symbol = await contract.symbol();
  }
```

You can also resume this into a single line using the `callContract` syntax sugar method

```TypeScript
  myMethod() {
    const symbol = await this.web3Service
    .callContract({
      contract: '0x0SampleContract',
      method: 'symbol',
      arguments: [],
    })
  }
```

#### BalanceOf

The web3 module provides both a set of non-protected endpoints as well as the respective internal functions to check the balance of a wallet address.

##### Endpoint details (erc20)

- URL: [http://server/web3/balance/address/:address/token/:tokenContract/erc20]()
- Verb: GET
- Response(application/json)

```json
{
  "address": "0x0address",
  "amount": "amountWithDecimals",
  "tokenContract": "0x0erc20Contract"
}
```

##### BalanceOf function (erc20)

There might be scenarios where you need to validate if some user has the balance that it claims to have. For this purpose, you can make use of the `getBalanceOfTokenInAddress` function. This function acepts two arguments

- address (to consult)
- tokenContract (token erc20 address)

Example usage

```TypeScript
@Injectable()
export class SampleService {
  // First inject the web3 service
  constructor(private readonly web3Service: Web3Service){
  }

  async myMethod(requesterAddress: string) {
    const requesterBalance = await this.web3Service
    .getBalanceOfTokenInAddress(
      requesterAddress,
      '0xMyContractAddress'
      );

    if (requesterBalance.amount < minAmount) {
      // Do something
    }
  }
}
```

##### Endpoint details (erc721)

- URL: [http://server/web3/balance/address/:address/token/:tokenContract/erc721]()
- Verb: GET
- Response(application/json)

```json
{
  "address": "0x0address",
  "amount": "amountWithDecimals",
  "tokenContract": "0x0erc20Contract",
  "tokenIds": [1, 2, 3]
}
```

##### BalanceOf function (erc721)

Similarly, you can consult the amount and token ids in possesion of a specified address using the `getTokenIdsForAddress` method. Function receives two arguments

- address (to consult)
- tokenContract (token erc20 address)

Example usage

```TypeScript
@Injectable()
export class SampleService {
  // First inject the web3 service
  constructor(private readonly web3Service: Web3Service){
  }

  async myMethod(requesterAddress: string) {
    const requesterBalance = await this.web3Service
    .getTokenIdsForAddress(
      requesterAddress,
      '0xMyContractAddress'
      );

    if (!requesterBalance.tokenIds.includes(12)) {
      // Do something
    }
  }
}
```

## Installation

Installation is simple enough as running the following prompts

```bash
# copy .env vars
$ cp example.env .env

# install deps
$ npm install
```

## Running the app

```bash
# run containers
$ docker compose up -d

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- LinkedIn: [Iván Miragaya](https://linkedin/in/miragaya-ivan)
