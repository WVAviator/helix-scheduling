import { UsersService } from './../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfileController', () => {
  let controller: ProfilesController;
  let fakeProfilesService;
  let fakeUsersService;

  beforeEach(async () => {
    fakeProfilesService = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOrganizationId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    fakeUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: fakeProfilesService },
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
