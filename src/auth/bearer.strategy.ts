import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios, { AxiosInstance } from 'axios';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  private readonly axios: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    super();

    this.axios = axios.create({
      baseURL: this.configService.get<string>('AUTHORIZATION_URL'),
    });
  }

  async validate(token: string): Promise<any> {
    try {
      const res = await this.axios.get('/projects/@me/token/verify', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
