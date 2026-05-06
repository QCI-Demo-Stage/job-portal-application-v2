import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: 'Registered email address.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Str0ng_Password!',
    description: 'Account password.',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
