import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  start: Date;

  @IsDate()
  @IsNotEmpty()
  end: Date;
}
