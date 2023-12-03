import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateUserDTO) {
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    return await this.prisma.users.create({
      data: {
        ...data,
        createdAt,
        updatedAt,
      },
    });
  }

  async list() {
    return await this.prisma.users.findMany();
  }

  async show(id: number) {
    await this.exists(id);
    return await this.prisma.users.findUnique({ where: { id } });
  }

  async update(data: UpdatePutUserDTO, id: number) {
    await this.exists(id);
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);
    const updatedAt = new Date().toISOString();
    return await this.prisma.users.update({
      data: { ...data, updatedAt: updatedAt },
      where: {
        id,
      },
    });
  }

  async updatePartial(data: UpdatePatchUserDTO, id: number) {
    await this.exists(id);
    const updatedAt = new Date().toISOString();

    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }
    return await this.prisma.users.update({
      data: { ...data, updatedAt: updatedAt },
      where: {
        id,
      },
    });
  }

  async delete(id: number) {
    await this.exists(id);
    return await this.prisma.users.delete({ where: { id } });
  }

  async exists(id: number) {
    if (
      !(await this.prisma.users.count({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`O usuário ${id} não existe`);
    }
  }
}
