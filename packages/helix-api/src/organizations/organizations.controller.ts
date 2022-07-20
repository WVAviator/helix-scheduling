import { RolesGuard } from './../rbac/role.guard';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { Role } from './../rbac/role.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { RequireRole } from '../rbac/role.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @RequireRole(Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.organizationsService.findBySlug(slug);
  }

  @RequireRole(Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  @RequireRole(Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(+id);
  }
}
