import { APIRequestContext } from '@playwright/test';
import { ApiHelper } from '@utils/ApiHelper';
import { config } from '@config/index';

export class AuthApi {
  private api: ApiHelper;

  constructor(request: APIRequestContext) {
    this.api = new ApiHelper(request, config.apiUrl);
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    return this.api.post('/auth/login', { username, password });
  }
}
