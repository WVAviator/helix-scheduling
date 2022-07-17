import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  companyId: number;

  @IsPhoneNumber()
  @IsOptional()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;
}
