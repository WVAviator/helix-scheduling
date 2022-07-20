import { Role } from './../rbac/role.enum';
import { RolesGuard } from './../rbac/role.guard';
import { SetRoleDto } from './dto/set-role.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RequireRole } from '../rbac/role.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @RequireRole(Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('roles')
  async setRole(@Body() setRoleDto: SetRoleDto) {
    return this.authService.setRole(setRoleDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
