import { clearDatabase } from '../tests/helpers/clear-database.helper';
import { Employee } from '../employee/entities/employee.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let dataSource: DataSource;
  let organizationsRepository: Repository<Organization>;
  let employeeRepository: Repository<Employee>;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [Organization, Employee],
    });
    await dataSource.initialize();

    organizationsRepository = dataSource.getRepository(Organization);
    employeeRepository = dataSource.getRepository(Employee);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(async () => {
    employeeRepository.clear();
    organizationsRepository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a proper slug when a new organization is passed', async () => {
    const org = await service.create({ name: 'Test Organization' });
    expect(org.slug).toBe('test-organization');
  });

  it('should not allow duplicate slugs for organizations with the same name', async () => {
    const org1 = await service.create({ name: 'Test Organization' });
    const org2 = await service.create({ name: 'Test Organization' });
    const org3 = await service.create({ name: 'Test Organization' });
    expect(org1.slug).toBe('test-organization');
    expect(org2.slug).toBe('test-organization-1');
    expect(org3.slug).toBe('test-organization-2');
  });

  it('should save and retrieve an organization by its id', async () => {
    const savedOrg = await service.create({ name: 'Test Organization' });
    const retrievedOrg = await service.findById(savedOrg.id);
    expect(retrievedOrg).toEqual(savedOrg);
  });

  it('should save and retrieve all organizations', async () => {
    const org1 = await service.create({ name: 'Test Organization 1' });
    const org2 = await service.create({ name: 'Test Organization 2' });
    const orgs = await service.findAll();
    expect(orgs).toEqual([org1, org2]);
  });

  it('should update an organization by its id', async () => {
    const org = await service.create({ name: 'Test Organization' });
    await service.update(org.id, { name: 'Updated Organization' });
    const updatedOrg = await service.findById(org.id);
    expect(updatedOrg.name).toBe('Updated Organization');
  });

  it('should not allow invalid slug updates', async () => {
    await service.create({ name: 'Test Organization' });
    const org = await service.create({ name: 'Test Organization' });

    await expect(
      service.update(org.id, { slug: 'test-organization' }),
    ).rejects.toThrow();

    const orgUpdated = await service.findById(org.id);
    expect(orgUpdated.slug).toBe('test-organization-1');
  });

  it('should remove an organization by its id', async () => {
    const org = await service.create({ name: 'Test Organization' });
    await service.remove(org.id);
    const removedOrg = await service.findById(org.id);
    expect(removedOrg).toBeNull();
  });

  it('should not allow removing an organization that does not exist', async () => {
    await expect(service.remove(1)).rejects.toThrow();
  });
});
