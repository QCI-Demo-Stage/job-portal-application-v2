import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import {
  AuthSessionResponseDto,
  AuthTokensOnlyResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new account',
    description:
      'Creates a user with the requested role (`job_seeker` or `employer`), hashes the password, and returns JWT access and refresh tokens alongside basic profile fields.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created and authenticated.',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed (email format, password length, role, …).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email address is already registered.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Validates credentials for active users and returns access and refresh tokens plus profile fields.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authenticated successfully.',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or inactive account.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Exchanges a valid refresh token for a new access/refresh pair without re-entering credentials.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New tokens issued.',
    type: AuthTokensOnlyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token missing, invalid, or expired.',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
