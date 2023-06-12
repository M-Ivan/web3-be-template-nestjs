import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInput {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  msg: string;

  @IsString()
  @IsNotEmpty()
  sig: string;
}
