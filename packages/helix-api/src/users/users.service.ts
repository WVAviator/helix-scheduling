import { Role } from './../rbac/role.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

interface FindUserOptions {
  includePassword?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      ...createUserDto,
    });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findById(id: number, options: FindUserOptions = {}) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: options.includePassword
        ? ['id', 'email', 'password', 'role']
        : ['id', 'email', 'role'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    return user;
  }

  async findByEmail(email: string, options: FindUserOptions = {}) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: options.includePassword
        ? ['id', 'email', 'password']
        : ['id', 'email'],
    });
    return user;
  }

  async update(id: number, updateUserDto: Partial<UpdateUserDto>) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async setRole(id: number, role: Role) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    user.role = role;
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }
    return this.userRepository.remove(user);
  }
}
