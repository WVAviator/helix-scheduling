import { SetRoleDto } from './dto/set-role.dto';
import { User } from './../users/entities/user.entity';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const storedUsers: User[] = [];
    fakeAuthService = {
      login: (user: User) => {
        if (!storedUsers.find((u) => u.id === user.id)) {
          return null;
        }
        return Promise.resolve({ access_token: 'abc' });
      },
      createUser: (createUserDto: CreateUserDto) => {
        const createdUser = {
          id: Math.floor(Math.random() * 99999),
          ...createUserDto,
        } as User;
        storedUsers.push(createdUser);
        return Promise.resolve(createdUser);
      },
      setRole: (setRoleDto: SetRoleDto) => {
        const { userId, role } = setRoleDto;
        const retrievedUserIndex = storedUsers.findIndex(
          (u) => u.id === userId,
        );
        storedUsers[retrievedUserIndex].role = role;
        return Promise.resolve(storedUsers[retrievedUserIndex]);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: fakeAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
