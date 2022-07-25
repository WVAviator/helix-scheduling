import { AssignShiftDto } from './dto/assign-shift.dto';
import { Role } from './../rbac/role.enum';
import { RolesGuard } from './../rbac/role.guard';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { RequireRole } from '../rbac/role.decorator';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @RequireRole(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createShiftDto: CreateShiftDto[]) {
    return this.shiftsService.create(createShiftDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('unassigned')
  findUnassigned() {
    return this.shiftsService.findUnassigned();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  findByUser(@Param('id') id: string) {
    return this.shiftsService.findAssigned(+id);
  }

  @RequireRole(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('assign')
  assignShift(@Body() assignShiftDto: AssignShiftDto) {
    return this.shiftsService.assign(assignShiftDto);
  }

  @RequireRole(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(+id, updateShiftDto);
  }

  @RequireRole(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(+id);
  }
}
