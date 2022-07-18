import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UsersService } from './../users/users.service';
import { Profile } from './entities/profile.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dtos/create-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    private usersService: UsersService,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const { userId, ...rest } = createProfileDto;

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const profile = this.profilesRepository.create({
      userId: user.id,
      user,
      ...rest,
    });
    return this.profilesRepository.save(profile);
  }

  findById(id: number) {
    return this.profilesRepository.findOne({ where: { userId: id } });
  }

  findAll() {
    return this.profilesRepository.find();
  }

  findByOrganizationSlug(organizationSlug: string) {
    const query = this.profilesRepository.createQueryBuilder('profile');
    query.innerJoin('profile.user', 'user');
    query.innerJoin('user.organization', 'organization');
    query.where('organization.slug = :organizationSlug', { organizationSlug });
    return query.getMany();
  }

  async update(id: number, updateProfileDto: Partial<UpdateProfileDto>) {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return this.profilesRepository.save({ ...profile, ...updateProfileDto });
  }

  async delete(id: number) {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return this.profilesRepository.remove(profile);
  }
}
