// users/user.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email?: string | undefined; // Change from string | null to string | undefined

  @IsOptional()
  @IsString()
  avatarurl?: string | undefined; // Change from string | null to string | undefined

  @IsNotEmpty()
  @IsString()
  oauthprovider: string;

  @IsNotEmpty()
  @IsString()
  oauthid: string;
}