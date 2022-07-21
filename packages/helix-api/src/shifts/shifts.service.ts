import { Shift } from './entities/shift.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftsRepository: Repository<Shift>,
  ) {}
  create(createShiftDto: CreateShiftDto) {
    const shift = this.shiftsRepository.create(createShiftDto);
    return this.shiftsRepository.save(shift);
  }

  findAll() {
    return this.shiftsRepository.find();
  }

  findUnassigned() {
    return this.shiftsRepository.find({
      where: {
        user: null,
      },
    });
  }

  findOne(id: number) {
    return this.shiftsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateShiftDto: UpdateShiftDto) {
    const shift = await this.findOne(id);
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return this.shiftsRepository.save({ ...shift, ...updateShiftDto });
  }

  async remove(id: number) {
    const shift = await this.findOne(id);
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return this.shiftsRepository.remove(shift);
  }
}
