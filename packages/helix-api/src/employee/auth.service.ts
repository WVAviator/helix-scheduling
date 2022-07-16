import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private employeeService: EmployeeService) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, title, password, organizationId } = createEmployeeDto;

    const existingEmployee = await this.employeeService.findByEmail(email);
    if (existingEmployee) {
      throw new BadRequestException(
        `Employee with email ${email} already exists`,
      );
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '$' + hash.toString('hex');

    const employee = this.employeeService.create({
      name,
      email,
      title,
      password: result,
      organizationId,
    });
    return employee;
  }

  async authenticate(email: string, password: string) {
    const employee = await this.employeeService.findByEmail(email, {
      includePassword: true,
    });
    if (!employee) {
      throw new BadRequestException(`Employee with email ${email} not found`);
    }

    const [salt, storedHash] = employee.password.split('$');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid password');
    }

    return employee;
  }
}
