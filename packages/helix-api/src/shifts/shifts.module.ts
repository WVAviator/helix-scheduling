import { User } from './../users/entities/user.entity';
import { Shift } from './entities/shift.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shift])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
})
export class ShiftsModule {}
