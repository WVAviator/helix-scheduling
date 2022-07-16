import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, title, password } = createEmployeeDto;
    const employee = this.employeeRepository.create({
      name,
      email,
      title,
      password,
    });
    return this.employeeRepository.save(employee);
  }

  findAll() {
    return this.employeeRepository.find();
  }

  findById(id: number) {
    return this.employeeRepository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.employeeRepository.findOne({ where: { email } });
  }

  async update(id: number, updateEmployeeDto: Partial<UpdateEmployeeDto>) {
    const employee = await this.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: number) {
    const employee = await this.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return this.employeeRepository.remove(employee);
  }
}
