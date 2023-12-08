import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
  ) {}

  async createToken(user: users) {
    return {
      accessToken: this.jwtService.sign(
        {
          sub: user.id,
          name: user.name,
          email: user.email,
        },
        { expiresIn: '4h', issuer: this.issuer, audience: this.audience },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'login',
      });

      return data;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token: string) {
    try {
      if (this.checkToken(token)) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  async login(data: AuthLoginDTO) {
    const user = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Dados incorretos');
    }

    if (!(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Dados incorretos');
    }
    return this.createToken(user);
  }

  async forget(data: AuthForgetDTO) {
    const user = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Dados incorretos');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      { expiresIn: '30 minutes', issuer: 'forget', audience: 'users' },
    );
    await this.mailer.sendMail({
      subject: 'Recuperação de Senha',
      to: 'alexandre.mota355@gmail.com',
      template: 'forget',
      context: {
        name: user.name,
        token: token,
      },
    });

    return true;
  }

  async reset(data: AuthResetDTO, id: number) {
    try {
      const user = await this.prisma.users.update({
        where: {
          id,
        },
        data: {
          password: data.password,
        },
      });
      return this.createToken(user);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);
    return this.createToken(user);
  }
}
