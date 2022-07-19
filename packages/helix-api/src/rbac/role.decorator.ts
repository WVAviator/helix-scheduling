import { Role } from './role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const RequireRole = (role: Role) => SetMetadata(ROLE_KEY, role);
