import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';

@Injectable()
export class FileService {
  async upload(foto: Express.Multer.File, path) {
    return writeFile(path, foto.buffer);
  }
}
