import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from './../helpers/mockrepository';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';

describe('ShiftsService', () => {
  let shiftsService: ShiftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        {
          provide: getRepositoryToken(Shift),
          useClass: MockRepository<Shift>,
        },
      ],
    }).compile();

    shiftsService = module.get<ShiftsService>(ShiftsService);
  });

  it('should be defined', () => {
    expect(shiftsService).toBeDefined();
  });

  it('should save and fetch a shift', async () => {
    const createdShift = await shiftsService.create({
      name: 'Night Shift',
      start: new Date(2022, 6, 1, 18, 0, 0, 0),
      end: new Date(2022, 6, 2, 4, 0, 0, 0),
    });
    const fetchedShift = await shiftsService.findOne(createdShift.id);
    expect(fetchedShift).toEqual(createdShift);
  });
});
