import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('users')
  findAll() {
    return this.userService.findAll();
  }

  @Get('/:organizationSlug/users')
  findByOrganizationSlug(@Param('organizationSlug') organizationSlug: string) {
    return this.userService.findByOrganizationSlug(organizationSlug);
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Patch('users/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
