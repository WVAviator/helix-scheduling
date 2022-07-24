import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let fakeUserService: Partial<UsersService>;
  let testUser: User;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      create: (createUserDto: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          ...createUserDto,
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
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    testUser = await authService.createUser({
      email: 'john@gmail.com',
      password: '123!',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should salt and hash a password', async () => {
    expect(testUser.password).not.toBe('123!');
  });

  it('should validate a password', async () => {
    const user = await authService.validateUser('john@gmail.com', '123!');
    expect(user).toBeDefined();
  });

  it('should reject an incorrect password', async () => {
    const response = await authService.validateUser('john@gmail.com', 'ABC!');

    expect(response).toBeNull();
  });

  it('two passwords should not have matching hashes', async () => {
    const testUser2 = await authService.createUser({
      email: 'jane@gmail.com',
      password: '123!',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(testUser.password).not.toBe(testUser2.password);
  });
});
