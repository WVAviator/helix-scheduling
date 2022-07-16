import { OrganizationsService } from './../organizations/organizations.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

interface FindEmployeeOptions {
  includePassword?: boolean;
}
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private organizationsService: OrganizationsService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, title, password, organizationId } = createEmployeeDto;
    const organization = await this.organizationsService.findById(
      +organizationId,
    );
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    const employee = this.employeeRepository.create({
      name,
      email,
      title,
      password,
      organization,
    });
    return this.employeeRepository.save(employee);
  }

  async assignOrganization(employeeId: number, organizationId: number) {
    const organization = await this.organizationsService.findById(
      organizationId,
    );
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    const employee = await this.findById(employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }

    employee.organization = organization;
    return this.employeeRepository.save(employee);
  }

  findAll() {
    return this.employeeRepository.find();
  }

  findById(id: number, options: FindEmployeeOptions = {}) {
    if (options.includePassword) {
      return this.employeeRepository
        .createQueryBuilder()
        .where('employee.id = :id', { id })
        .addSelect('password')
        .getOne();
    }

    return this.employeeRepository.findOne({ where: { id } });
  }

  findByEmail(email: string, options: FindEmployeeOptions = {}) {
    if (options.includePassword) {
      return this.employeeRepository
        .createQueryBuilder()
        .where('employee.email = :email', { email })
        .addSelect('password')
        .getOne();
    }

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
