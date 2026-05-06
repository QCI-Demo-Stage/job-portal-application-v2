import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessJwtPayload } from './strategies/jwt.strategy';

type RefreshJwtPayload = {
  sub: string;
  typ: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const firstName = dto.firstName?.trim() || 'User';
    const lastName = dto.lastName?.trim() || 'Account';
    const user = await this.usersService.createWithRole(
      dto.email,
      passwordHash,
      dto.role,
      firstName,
      lastName,
    );
    const role = this.usersService.resolvePrimaryRole(user);
    if (!role) {
      throw new InternalServerErrorException('Could not resolve user role');
    }
    const tokens = await this.signTokens(user.id, user.email, role);
    return {
      user: { id: user.id, email: user.email, role },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const role = this.usersService.resolvePrimaryRole(user);
    if (!role) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.signTokens(user.id, user.email, role);
    return {
      user: { id: user.id, email: user.email, role },
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: RefreshJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(
        dto.refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userId = Number(payload.sub);
    const user = await this.usersService.findByIdWithRoles(userId);
    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const role = this.usersService.resolvePrimaryRole(user);
    if (!role) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.signTokens(user.id, user.email, role);
  }

  private async signTokens(userId: number, email: string, role: Role) {
    const accessPayload: AccessJwtPayload = {
      sub: String(userId),
      email,
      role,
      typ: 'access',
    };
    const refreshPayload: RefreshJwtPayload = {
      sub: String(userId),
      typ: 'refresh',
    };

    const accessSecret = this.config.getOrThrow<string>('JWT_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ??
      this.config.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.config.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as string,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as string,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
