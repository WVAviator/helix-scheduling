import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const { name } = createOrganizationDto;
    const slug = await this.generateSlug(name);

    const organization = this.organizationRepository.create({ name, slug });
    return this.organizationRepository.save(organization);
  }

  async generateSlug(name: string) {
    const base = name.toLowerCase().replace(/\s+/g, '-');
    const existingSlugs = (await this.findAll()).map(
      (organization) => organization.slug,
    );

    if (!existingSlugs.includes(base)) {
      return base;
    }

    let slugIncrement = 1;
    let slug = `${base}-${slugIncrement}`;
    while (existingSlugs.includes(slug)) {
      slugIncrement++;
      slug = `${base}-${slugIncrement}`;
    }
    return slug;
  }

  async validateSlug(slug: string) {
    if (!slug) {
      return false;
    }
    const existingSlugs = (await this.findAll()).map(
      (organization) => organization.slug,
    );
    return !existingSlugs.includes(slug);
  }

  async findUsers(id: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return organization.users;
  }

  findAll() {
    return this.organizationRepository.find();
  }

  findById(id: number) {
    return this.organizationRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateOrganizationDto: Partial<UpdateOrganizationDto>,
  ) {
    let { name, slug } = updateOrganizationDto;
    const organization = await this.findById(id);

    if (!organization) {
      throw new NotFoundException(`Organization with id #${id} not found`);
    }

    if (name) {
      organization.name = name;
    }

    if (slug) {
      const slugIsValid = await this.validateSlug(slug);
      if (slugIsValid) {
        organization.slug = slug;
      } else {
        throw new Error(`Slug ${slug} is already taken`);
      }
    }

    return this.organizationRepository.save(organization);
  }

  async remove(id: number) {
    const organization = await this.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with id #${id} not found`);
    }
    return this.organizationRepository.remove(organization);
  }
}
