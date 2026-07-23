import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountsService } from '../../accounts/accounts.service';
import { resolveJwtSecret } from '../../config/jwt.config';
import { AccountRole } from '../../common/types/account-role';
import { AuthUserPayload } from '../types/auth-user.payload';

interface JwtPayload {
  sub: string;
  email: string;
  role: AccountRole;
  profileId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly accountsService: AccountsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUserPayload> {
    if (!payload?.sub) {
      throw new UnauthorizedException('נדרשת התחברות תקינה');
    }

    try {
      await this.accountsService.assertAccountActive(payload.sub);
    } catch {
      throw new UnauthorizedException('החשבון אינו פעיל');
    }

    return {
      accountId: payload.sub,
      email: payload.email,
      role: payload.role,
      profileId: payload.profileId,
    };
  }
}
