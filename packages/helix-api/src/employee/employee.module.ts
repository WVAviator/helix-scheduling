import { OrganizationsModule } from './../organizations/organizations.module';
import { Organization } from 'src/organizations/entities/organization.entity';
import { OrganizationsService } from './../organizations/organizations.service';
import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), OrganizationsModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, AuthService],
})
export class EmployeeModule {}
