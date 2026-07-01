import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserPayload } from '../types/auth-user.payload';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'person' | 'shadchan';
  profileId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-shiduchim-secret'),
    });
  }

  validate(payload: JwtPayload): AuthUserPayload {
    if (!payload?.sub) {
      throw new UnauthorizedException('נדרשת התחברות תקינה');
    }
    return {
      accountId: payload.sub,
      email: payload.email,
      role: payload.role,
      profileId: payload.profileId,
    };
  }
}
