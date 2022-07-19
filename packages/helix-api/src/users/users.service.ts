import { Role } from './../rbac/role.enum';
import { OrganizationsService } from '../organizations/organizations.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';
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
    private organizationsService: OrganizationsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, organizationId } = createUserDto;
    const organization = await this.organizationsService.findById(
      +organizationId,
    );
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    const user = this.userRepository.create({
      email,
      password,
      organization,
    });
    return this.userRepository.save(user);
  }

  async assignOrganization(userId: number, organizationId: number) {
    const organization = await this.organizationsService.findById(
      organizationId,
    );
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.organization = organization;
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findByOrganizationSlug(organizationSlug: string) {
    const query = this.userRepository.createQueryBuilder('user');
    query.innerJoin('user.organization', 'organization');
    query.where('organization.slug = :organizationSlug', {
      organizationSlug,
    });
    return query.getMany();
  }

  findById(id: number, options: FindUserOptions = {}) {
    return this.userRepository.findOne({
      where: { id },
      select: options.includePassword
        ? ['id', 'email', 'password', 'role']
        : ['id', 'email', 'role'],
    });
  }

  findByEmail(email: string, options: FindUserOptions = {}) {
    return this.userRepository.findOne({
      where: { email },
      select: options.includePassword
        ? ['id', 'email', 'password']
        : ['id', 'email'],
    });
  }

  async update(id: number, updateUserDto: Partial<UpdateUserDto>) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async setRole(id: number, role: Role) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.role = role;
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.remove(user);
  }
}
