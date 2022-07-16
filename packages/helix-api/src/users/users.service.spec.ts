import { Organization } from '../organizations/entities/organization.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let userService: UsersService;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let fakeOrganizationsService: Partial<OrganizationsService>;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [User, Organization],
      synchronize: true,
    });
    await dataSource.initialize();

    userRepository = dataSource.getRepository(User);
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
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

    userService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    userRepository.clear();
    organizationRepository.clear();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should add and find an user in the database', async () => {
    await userService.create({
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    const users = await userService.findAll();
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('john@gmail.com');
  });

  it('should update an user in the database', async () => {
    const user = await userService.create({
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await userService.update(user.id, { email: 'john2@gmail.com' });
    const queriedUser = await userService.findByEmail('john2@gmail.com');

    expect(queriedUser).toBeDefined();
  });

  it('should delete an user from the database', async () => {
    const user = await userService.create({
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await userService.remove(user.id);
    const users = await userService.findAll();
    expect(users.length).toBe(0);
  });

  it('should error if attempting to update or delete nonexistent user', async () => {
    const user = await userService.create({
      email: 'john@gmail.com',
      password: '123!',
      organizationId: 1,
    });
    await expect(userService.remove(user.id + 1)).rejects.toThrow();
    await expect(
      userService.update(user.id + 1, { email: 'john2@gmail.com' }),
    ).rejects.toThrow();
  });
});
