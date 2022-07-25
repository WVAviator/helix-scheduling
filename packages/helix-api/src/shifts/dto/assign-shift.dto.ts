import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class AssignShiftDto {
  @IsNumber()
  userId: number | null;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  shiftIds: number[];
}
