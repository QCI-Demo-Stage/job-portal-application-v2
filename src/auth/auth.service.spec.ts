jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

const ACCESS_SECRET = 'unit-test-jwt-access-secret-32chars!!';
const REFRESH_SECRET = 'unit-test-jwt-refresh-secret-32chars!!';

describe('AuthService', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      | 'findByEmail'
      | 'createWithRole'
      | 'resolvePrimaryRole'
      | 'findByIdWithRoles'
    >
  >;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      createWithRole: jest.fn(),
      resolvePrimaryRole: jest.fn(),
      findByIdWithRoles: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: ACCESS_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'JWT_SECRET') {
                return ACCESS_SECRET;
              }
              if (key === 'JWT_REFRESH_SECRET') {
                return REFRESH_SECRET;
              }
              throw new Error(`Unexpected config key: ${key}`);
            },
            get: (key: string, defaultValue?: string) => {
              if (key === 'JWT_ACCESS_EXPIRES_IN') {
                return '15m';
              }
              if (key === 'JWT_EXPIRES_IN') {
                return defaultValue ?? '15m';
              }
              if (key === 'JWT_REFRESH_EXPIRES_IN') {
                return '7d';
              }
              return defaultValue;
            },
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('register', () => {
    it('hashes the password, persists via UsersService, and returns JWTs with role in access payload', async () => {
      const dto: RegisterDto = {
        email: 'new-hire@example.com',
        password: 'ValidPass123',
        role: Role.Seeker,
        firstName: 'Ada',
        lastName: 'Lovelace',
      };

      usersService.findByEmail.mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password-bcrypt' as never);
      usersService.createWithRole.mockResolvedValue({
        id: 42,
        email: dto.email.toLowerCase(),
        passwordHash: 'hashed-password-bcrypt',
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        phone: null,
        isActive: true,
        userRoles: [],
      } as unknown as NonNullable<Awaited<ReturnType<UsersService['findByEmail']>>>);
      usersService.resolvePrimaryRole.mockReturnValue(Role.Seeker);

      const result = await authService.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(usersService.createWithRole).toHaveBeenCalledWith(
        dto.email,
        'hashed-password-bcrypt',
        Role.Seeker,
        dto.firstName,
        dto.lastName,
      );
      expect(result.user).toEqual({
        id: 42,
        email: dto.email.toLowerCase(),
        role: Role.Seeker,
      });
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();

      const accessPayload = jwtService.decode(result.accessToken) as {
        sub: string;
        email: string;
        role: Role;
        typ: string;
      };
      expect(accessPayload.sub).toBe('42');
      expect(accessPayload.email).toBe(dto.email.toLowerCase());
      expect(accessPayload.role).toBe(Role.Seeker);
      expect(accessPayload.typ).toBe('access');

      const refreshPayload = jwtService.decode(result.refreshToken) as {
        sub: string;
        typ: string;
      };
      expect(refreshPayload.sub).toBe('42');
      expect(refreshPayload.typ).toBe('refresh');
    });

    it('throws ConflictException when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'taken@example.com',
      } as Awaited<ReturnType<UsersService['findByEmail']>>);

      await expect(
        authService.register({
          email: 'taken@example.com',
          password: 'ValidPass123',
          role: Role.Employer,
        } as RegisterDto),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersService.createWithRole).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when primary role cannot be resolved', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue('hash' as never);
      usersService.createWithRole.mockResolvedValue({
        id: 7,
        email: 'orphan@example.com',
        passwordHash: 'hash',
        userRoles: [],
      } as never);
      usersService.resolvePrimaryRole.mockReturnValue(null);

      await expect(
        authService.register({
          email: 'orphan@example.com',
          password: 'ValidPass123',
          role: Role.Employer,
        } as RegisterDto),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const activeUser = {
      id: 99,
      email: 'worker@example.com',
      passwordHash: 'stored-hash',
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      isActive: true,
      userRoles: [],
    } as unknown as NonNullable<Awaited<ReturnType<UsersService['findByEmail']>>>;

    it('returns JWTs when credentials and role resolution succeed', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      usersService.resolvePrimaryRole.mockReturnValue(Role.Employer);

      const result = await authService.login({
        email: 'worker@example.com',
        password: 'CorrectPass123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'CorrectPass123',
        'stored-hash',
      );
      const accessPayload = jwtService.decode(result.accessToken) as {
        role: Role;
        email: string;
        typ: string;
      };
      expect(accessPayload.role).toBe(Role.Employer);
      expect(accessPayload.email).toBe('worker@example.com');
      expect(accessPayload.typ).toBe('access');
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'worker@example.com',
          password: 'WrongPass123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(usersService.resolvePrimaryRole).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the user is missing or inactive', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        authService.login({
          email: 'nobody@example.com',
          password: 'SomePass1234',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      usersService.findByEmail.mockResolvedValue({
        ...activeUser,
        isActive: false,
      } as typeof activeUser);
      await expect(
        authService.login({
          email: 'worker@example.com',
          password: 'SomePass1234',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when primary role cannot be resolved', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      usersService.resolvePrimaryRole.mockReturnValue(null);

      await expect(
        authService.login({
          email: 'worker@example.com',
          password: 'CorrectPass123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
