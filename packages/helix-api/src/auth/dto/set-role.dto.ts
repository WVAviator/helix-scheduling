import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Role } from '../../rbac/role.enum';

export class SetRoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  role: Role;
}
