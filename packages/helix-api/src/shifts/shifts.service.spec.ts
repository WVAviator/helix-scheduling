import { UsersService } from './../users/users.service';
import { User } from './../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from './../helpers/mockrepository';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';

describe('ShiftsService', () => {
  let shiftsService: ShiftsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        UsersService,
        {
          provide: getRepositoryToken(Shift),
          useClass: MockRepository<Shift>,
        },
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository<User>,
        },
      ],
    }).compile();

    shiftsService = module.get<ShiftsService>(ShiftsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(shiftsService).toBeDefined();
  });

  it('should save and fetch a shift', async () => {
    const createdShift = await shiftsService.create([
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 1, 18, 0, 0, 0),
        end: new Date(2022, 6, 2, 4, 0, 0, 0),
      },
    ]);
    const fetchedShift = await shiftsService.findOne(createdShift[0].id);
    expect(fetchedShift).toEqual(createdShift[0]);
  });

  it('should allow multiple shifts added at the same time', async () => {
    const createdShifts = await shiftsService.create([
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 1, 18, 0, 0, 0),
        end: new Date(2022, 6, 2, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 1, 18, 0, 0, 0),
        end: new Date(2022, 6, 2, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 1, 18, 0, 0, 0),
        end: new Date(2022, 6, 2, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 2, 18, 0, 0, 0),
        end: new Date(2022, 6, 3, 4, 0, 0, 0),
      },
    ]);
    const fetchedShifts = await shiftsService.findAll();
    expect(fetchedShifts).toEqual(createdShifts);
  });

  it('should allow editing an existing shift', async () => {
    const createdShift = (
      await shiftsService.create([
        {
          name: 'Night Shift',
          start: new Date(2022, 6, 1, 18, 0, 0, 0),
          end: new Date(2022, 6, 2, 4, 0, 0, 0),
        },
      ])
    )[0];
    await shiftsService.update(createdShift.id, {
      name: 'Graveyard Shift',
    });
    const updatedShift = await shiftsService.findOne(createdShift.id);
    expect(updatedShift.name).toEqual('Graveyard Shift');
  });

  it('can assign and find unassigned shifts', async () => {
    const createdShifts = await shiftsService.create([
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 1, 18, 0, 0, 0),
        end: new Date(2022, 6, 2, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 2, 18, 0, 0, 0),
        end: new Date(2022, 6, 3, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 3, 18, 0, 0, 0),
        end: new Date(2022, 6, 4, 4, 0, 0, 0),
      },
      {
        name: 'Night Shift',
        start: new Date(2022, 6, 4, 18, 0, 0, 0),
        end: new Date(2022, 6, 5, 4, 0, 0, 0),
      },
    ]);
    const unassignedShifts = await shiftsService.findUnassigned();
    expect(unassignedShifts).toEqual(createdShifts);

    const user = await usersService.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
      password: 'password',
    });

    const assignedSubset = createdShifts.slice(0, 3);
    const unassignedSubset = createdShifts.slice(3);

    const assignShiftDto = {
      userId: user.id,
      shiftIds: assignedSubset.map((shift) => shift.id),
    };

    await shiftsService.assign(assignShiftDto);

    const assignedShifts = await shiftsService.findAssigned(user.id);

    expect(assignedShifts).toEqual(assignedSubset);

    const newUnassignedShifts = await shiftsService.findUnassigned();
    expect(newUnassignedShifts).toEqual(unassignedSubset);
  });
});
