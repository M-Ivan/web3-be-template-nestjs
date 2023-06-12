import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';

export function Authenticate(): any {
  return applyDecorators(UseGuards(AuthenticationGuard));
}
