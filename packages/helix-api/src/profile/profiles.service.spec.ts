import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './../users/users.service';
import { Organization } from './../organizations/entities/organization.entity';
import { Profile } from './entities/profile.entity';
import { User } from './../users/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let dataSource: DataSource;
  let profilesRepository: Repository<Profile>;
  let usersRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let fakeUsersService: Partial<UsersService>;
  let testOrganizations: Organization[];
  let testUsers: User[];

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [Profile, User, Organization],
      synchronize: true,
    });
    await dataSource.initialize();

    usersRepository = dataSource.getRepository(User);
    organizationRepository = dataSource.getRepository(Organization);
    profilesRepository = dataSource.getRepository(Profile);

    testOrganizations = [
      await organizationRepository.save({
        name: 'Microsoft',
        slug: 'microsoft',
      }),
      await organizationRepository.save({
        name: 'Amazon',
        slug: 'amazon',
      }),
    ];

    testUsers = [
      await usersRepository.save({
        email: 'john@gmail.com',
        password: 'Faraway12!',
        organization: testOrganizations[0],
      }),
      await usersRepository.save({
        email: 'jane@gmail.com',
        password: 'Faraway12!',
        organization: testOrganizations[0],
      }),
      await usersRepository.save({
        email: 'bob@gmail.com',
        password: 'Faraway12!',
        organization: testOrganizations[1],
      }),
      await usersRepository.save({
        email: 'gary@gmail.com',
        password: 'Faraway12!',
        organization: testOrganizations[1],
      }),
    ];

    fakeUsersService = {
      findById: (id) => {
        return Promise.resolve(testUsers.find((user) => user.id === id));
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: profilesRepository,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    profilesService = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(async () => {
    await profilesRepository.clear();
    await usersRepository.clear();
    await organizationRepository.clear();
  });

  it('should be defined', () => {
    expect(profilesService).toBeDefined();
  });

  it('should add a new profile in the database that syncs up with user', async () => {
    const profile = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12345,
      title: 'Software Engineer',
      userId: testUsers[0].id,
    };

    const newProfile = await profilesService.create(profile);
    expect(newProfile.userId).toEqual(testUsers[0].id);
    expect(newProfile.user).toEqual(testUsers[0]);
  });

  it('should return all profiles with given organization id', async () => {
    await profilesService.create({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12345,
      title: 'Software Engineer',
      userId: testUsers[0].id,
    });
    await profilesService.create({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12346,
      title: 'Software Engineer',
      userId: testUsers[1].id,
    });
    await profilesService.create({
      firstName: 'Bob',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12347,
      title: 'Software Engineer',
      userId: testUsers[2].id,
    });
    await profilesService.create({
      firstName: 'Gary',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12348,
      title: 'Software Engineer',
      userId: testUsers[3].id,
    });

    const organization = testOrganizations[0];
    const organizationProfiles = await profilesService.findByOrganizationSlug(
      organization.slug,
    );
    expect(organizationProfiles.map((profile) => profile.userId)).toEqual([
      testUsers[0].id,
      testUsers[1].id,
    ]);
  });

  it('should allow updating a user profile', async () => {
    const userId = testUsers[2].id;
    await profilesService.create({
      firstName: 'Bob',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12347,
      title: 'Software Engineer',
      userId,
    });

    const update = {
      firstName: 'Robert',
      companyId: 98765,
    };
    await profilesService.update(userId, update);

    const updatedProfile = await profilesService.findById(userId);
    expect(updatedProfile.firstName).toEqual('Robert');
    expect(updatedProfile.companyId).toEqual(98765);
    expect(updatedProfile.lastName).toEqual('Doe');
  });

  it('should allow deleting a user profile', async () => {
    const userId = testUsers[2].id;
    await profilesService.create({
      firstName: 'Bob',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      companyId: 12347,
      title: 'Software Engineer',
      userId,
    });

    await profilesService.delete(userId);

    const deletedProfile = await profilesService.findById(userId);
    expect(deletedProfile).toBeNull();
  });
});
