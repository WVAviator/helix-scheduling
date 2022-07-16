import { Organization } from '../organizations/entities/organization.entity';
import { OrganizationsService } from './../organizations/organizations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let dataSource: DataSource;
  let employeeRepository: Repository<Employee>;
  let organizationRepository: Repository<Organization>;
  let fakeOrganizationsService: Partial<OrganizationsService>;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [Employee, Organization],
    });
    await dataSource.initialize();

    employeeRepository = dataSource.getRepository(Employee);
    organizationRepository = dataSource.getRepository(Organization);
    const testOrganization = await organizationRepository.create({
      name: 'Test Organization',
      slug: 'test-organization',
    });
    await organizationRepository.save(testOrganization);
    fakeOrganizationsService = {
      findById: (id) => {
        return Promise.resolve(testOrganization);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepository,
        },
        {
          provide: OrganizationsService,
          useValue: fakeOrganizationsService,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(async () => {
    employeeRepository.clear();
    organizationRepository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add and find an employee in the database', async () => {
    await service.create({
      name: 'John',
      title: 'Software Engineer',
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    const employees = await service.findAll();
    expect(employees.length).toBe(1);
    expect(employees[0].name).toBe('John');
    expect(employees[0].title).toBe('Software Engineer');
    expect(employees[0].email).toBe('john@gmail.com');
  });

  it('should update an employee in the database', async () => {
    const employee = await service.create({
      name: 'John',
      title: 'Software Engineer',
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await service.update(employee.id, { email: 'john2@gmail.com' });
    const queriedEmployee = await service.findByEmail('john2@gmail.com');

    expect(queriedEmployee.name).toBe('John');
    expect(queriedEmployee.title).toBe('Software Engineer');
  });

  it('should delete an employee from the database', async () => {
    const employee = await service.create({
      name: 'John',
      title: 'Software Engineer',
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await service.remove(employee.id);
    const employees = await service.findAll();
    expect(employees.length).toBe(0);
  });

  it('should error if attempting to update or delete nonexistent employee', async () => {
    const employee = await service.create({
      name: 'John',
      title: 'Software Engineer',
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await expect(service.remove(employee.id + 1)).rejects.toThrow();
    await expect(
      service.update(employee.id + 1, { email: 'john2@gmail.com' }),
    ).rejects.toThrow();
  });
});
