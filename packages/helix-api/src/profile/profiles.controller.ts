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

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post('create')
  async createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  async findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.profilesService.findById(+id);
  }

  @Get(':organizationId')
  async findByOrganizationId(@Param('organizationId') organizationId: number) {
    return this.profilesService.findByOrganizationId(+organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProfileDto: Partial<CreateProfileDto>,
  ) {
    return this.profilesService.update(+id, updateProfileDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.profilesService.delete(+id);
  }
}
