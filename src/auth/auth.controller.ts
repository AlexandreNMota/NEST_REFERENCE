import {
  Controller,
  Body,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user-decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from 'src/file/file.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}
  @Post('login')
  async login(@Body() body: AuthLoginDTO) {
    return await this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return await this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() body: AuthForgetDTO) {
    return await this.authService.forget(body);
  }

  @UseGuards(AuthGuard)
  @Post('reset')
  async resest(@Body() body: AuthResetDTO, @User('id') id) {
    return this.authService.reset(body, id);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User() user) {
    return { user };
  }

  @UseInterceptors(FileInterceptor('arquivo'))
  @UseGuards(AuthGuard)
  @Post('foto')
  async uploadFoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 2000 }),
        ],
      }),
    )
    foto: Express.Multer.File,
  ) {
    const path = join(
      __dirname,
      '..',
      '..',
      'storage',
      'fotos',
      `foto-${user.id}.jpg`,
    );

    try {
      await this.fileService.upload(foto, path);
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { success: true };
  }

  @UseInterceptors(FilesInterceptor('arquivo'))
  @UseGuards(AuthGuard)
  @Post('fotos')
  async uploadFotos(
    @User() user,
    @UploadedFiles() fotos: Express.Multer.File[],
  ) {
    return fotos;
  }
}
