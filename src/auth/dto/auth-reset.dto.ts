import { IsStrongPassword } from 'class-validator';

export class AuthResetDTO {
  @IsStrongPassword({})
  password: string;

  // @IsJWT()
  // token: string;
}
