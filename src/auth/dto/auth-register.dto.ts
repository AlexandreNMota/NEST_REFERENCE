import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthLoginDTO } from './auth-login.dto';
import { Role } from 'src/enums/role.enum';

export class AuthRegisterDTO extends AuthLoginDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
