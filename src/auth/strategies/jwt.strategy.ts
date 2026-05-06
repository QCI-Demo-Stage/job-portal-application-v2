import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from '../../users/users.service';

export type AccessJwtPayload = {
  sub: string;
  email: string;
  role: Role;
  typ: 'access';
};

export type JwtUser = {
  userId: string;
  email: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessJwtPayload): Promise<JwtUser> {
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Invalid subject');
    }
    const user = await this.usersService.findByIdWithRoles(userId);
    if (!user?.isActive || user.email !== payload.email) {
      throw new UnauthorizedException('User no longer valid');
    }
    const role = this.usersService.resolvePrimaryRole(user);
    if (!role || role !== payload.role) {
      throw new UnauthorizedException('User no longer valid');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role,
    };
  }
}
