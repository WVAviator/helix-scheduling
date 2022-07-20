import { OrganizationGuard } from './../organizations/organization.guard';
import { RolesGuard } from './../rbac/role.guard';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { ProfilesService } from './profiles.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequireRole } from '../rbac/role.decorator';
import { Role } from '../rbac/role.enum';
import { UserGuard } from '../users/user.guard';

@Controller()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @RequireRole(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('profiles')
  async createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @RequireRole(Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profiles')
  async findAll() {
    return this.profilesService.findAll();
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get('profiles/:id')
  async findById(@Param('id') id: number) {
    return this.profilesService.findById(+id);
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get(':organizationSlug/profiles')
  async findByOrganizationId(
    @Param('organizationSlug') organizationSlug: string,
  ) {
    return this.profilesService.findByOrganizationSlug(organizationSlug);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Patch('profiles/:id')
  async update(
    @Param('id') id: number,
    @Body() updateProfileDto: Partial<CreateProfileDto>,
  ) {
    return this.profilesService.update(+id, updateProfileDto);
  }

  @RequireRole(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Delete('profiles/:id')
  async delete(@Param('id') id: number) {
    return this.profilesService.delete(+id);
  }
}
