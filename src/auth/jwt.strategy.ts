import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios, { AxiosInstance } from 'axios';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from './entities/token-payload.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly axios: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SECRET'),
    });

    this.axios = axios.create({
      baseURL: this.configService.get<string>('AUTHORIZATION_URL'),
    });
  }

  async validate(req: any, payload: TokenPayload) {
    try {
      await this.axios.get('/projects/@me/token/verify', {
        headers: {
          authorization: req.headers.authorization,
        },
      });

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
