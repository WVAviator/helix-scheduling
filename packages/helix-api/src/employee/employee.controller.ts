import { AuthService } from './auth.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.authService.createEmployee(createEmployeeDto);
  }

  @Post('/signin')
  async signin(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return this.authService.authenticate(email, password);
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findById(+id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Partial<UpdateEmployeeDto>,
  ) {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
