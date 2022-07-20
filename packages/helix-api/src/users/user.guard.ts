import { Role } from './../rbac/role.enum';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
export class UserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException(
        'You must be logged in to access this information.',
      );
    }

    if (user.role !== Role.USER) {
      return true;
    }

    const userId = request.params.id;

    if (userId !== user.id) {
      throw new UnauthorizedException(
        'You can only do this for your own user profile.',
      );
    }

    return true;
  }
}
