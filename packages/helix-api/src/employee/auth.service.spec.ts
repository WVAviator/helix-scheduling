import { Organization } from 'src/organizations/entities/organization.entity';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
describe('AuthService', () => {
  let authService: AuthService;
  let fakeEmployeeService: Partial<EmployeeService>;

  beforeEach(async () => {
    const employees: Employee[] = [];
    fakeEmployeeService = {
      create: (createEmployeeDto: CreateEmployeeDto) => {
        const { organizationId, ...rest } = createEmployeeDto;
        const organization: Organization = {
          id: organizationId,
          name: 'Company',
          slug: 'company',
          employees: [],
        };
        const employee = {
          id: Math.floor(Math.random() * 99999),
          organization,
          ...rest,
        } as Employee;
        employees.push(employee);
        return Promise.resolve(employee);
      },
      findAll: () => Promise.resolve(employees),
      findByEmail: (email: string) => {
        const employee = employees.find((employee) => employee.email === email);
        return Promise.resolve(employee);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        { provide: EmployeeService, useValue: fakeEmployeeService },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should salt and hash a password', async () => {
    const employee = await authService.createEmployee({
      name: 'John',
      email: 'john@gmail.com',
      password: '123!',
      title: 'Software Engineer',
      organizationId: 1,
    });
    expect(employee.password).not.toBe('123!');
  });

  it('should validate a password', async () => {
    await authService.createEmployee({
      name: 'John',
      email: 'john@gmail.com',
      password: '123!',
      title: 'Software Engineer',
      organizationId: 1,
    });
    const employee = await authService.authenticate('john@gmail.com', '123!');
    expect(employee).toBeDefined();
  });

  it('should reject an incorrect password', async () => {
    await authService.createEmployee({
      name: 'John',
      email: 'john@gmail.com',
      password: '123!',
      title: 'Software Engineer',
      organizationId: 1,
    });
    await expect(
      authService.authenticate('john@gmail.com', 'ABC!'),
    ).rejects.toThrow();
  });
});
