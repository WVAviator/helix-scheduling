import { IsNotEmpty, IsString } from 'class-validator';

export class AddEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
