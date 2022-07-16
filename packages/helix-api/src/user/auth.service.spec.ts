import { Organization } from 'src/organizations/entities/organization.entity';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
describe('AuthService', () => {
  let authService: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      create: (createUserDto: CreateUserDto) => {
        const { organizationId, ...rest } = createUserDto;
        const organization: Organization = {
          id: organizationId,
          name: 'Company',
          slug: 'company',
          users: [],
        };
        const user = {
          id: Math.floor(Math.random() * 99999),
          organization,
          ...rest,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
      findAll: () => Promise.resolve(users),
      findByEmail: (email: string) => {
        const user = users.find((user) => user.email === email);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: fakeUserService },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should salt and hash a password', async () => {
    const user = await authService.createUser({
      name: 'John',
      email: 'john@gmail.com',
      password: '123!',
      title: 'Software Engineer',
      organizationId: 1,
    });
    expect(user.password).not.toBe('123!');
  });

  it('should validate a password', async () => {
    await authService.createUser({
      name: 'John',
      email: 'john@gmail.com',
      password: '123!',
      title: 'Software Engineer',
      organizationId: 1,
    });
    const user = await authService.authenticate('john@gmail.com', '123!');
    expect(user).toBeDefined();
  });

  it('should reject an incorrect password', async () => {
    await authService.createUser({
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
