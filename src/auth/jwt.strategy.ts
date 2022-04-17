import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_OR_KEY'),
    });
  }

  async validate(req: any, payload: any) {
    const url = this.configService.get<string>('AUTH_URL');
    try {
      await axios.post(
        url.concat(`/auth/projects/${payload.project.id}/token/verify`),
        undefined,
        {
          headers: {
            authorization: req.headers.authorization,
          },
        },
      );

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
