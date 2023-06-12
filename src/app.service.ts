import { Injectable } from '@nestjs/common';
import { getAppVersion } from './common/helpers/configuration.helper';

@Injectable()
export class AppService {
  getVersion(): string {
    return getAppVersion();
  }
}
