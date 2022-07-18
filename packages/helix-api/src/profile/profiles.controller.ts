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
} from '@nestjs/common';

@Controller()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post('profiles')
  async createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get('profiles')
  async findAll() {
    return this.profilesService.findAll();
  }

  @Get('profiles/:id')
  async findById(@Param('id') id: number) {
    return this.profilesService.findById(+id);
  }

  @Get(':organizationSlug/profiles')
  async findByOrganizationId(
    @Param('organizationSlug') organizationSlug: string,
  ) {
    return this.profilesService.findByOrganizationSlug(organizationSlug);
  }

  @Patch('profiles/:id')
  async update(
    @Param('id') id: number,
    @Body() updateProfileDto: Partial<CreateProfileDto>,
  ) {
    return this.profilesService.update(+id, updateProfileDto);
  }

  @Delete('profiles/:id')
  async delete(@Param('id') id: number) {
    return this.profilesService.delete(+id);
  }
}
