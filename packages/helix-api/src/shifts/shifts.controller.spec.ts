import { UsersService } from './../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { MockRepository } from './../helpers/mockrepository';
import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

describe('ShiftsController', () => {
  let controller: ShiftsController;
  let fakeShiftsService: Partial<ShiftsService>;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeShiftsService = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAssigned: jest.fn(),
      findUnassigned: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    fakeUsersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [
        {
          provide: ShiftsService,
          useValue: fakeShiftsService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: getRepositoryToken(Shift),
          useClass: MockRepository<Shift>,
        },
      ],
    }).compile();

    controller = module.get<ShiftsController>(ShiftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
