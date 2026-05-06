import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Refresh token previously returned by login, register, or refresh.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwIjoicmVmcmVzaCJ9.example',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
