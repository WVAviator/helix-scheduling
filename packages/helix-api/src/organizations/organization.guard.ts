import { UsersService } from './../users/users.service';
import { User } from './../users/entities/user.entity';
import { Role } from './../rbac/role.enum';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';

export class OrganizationGuard implements CanActivate {
  constructor(@Inject(UsersService) private usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException(
        'You must be logged in to access this information.',
      );
    }

    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    const organizationSlug = request.params.organizationSlug;
    if (organizationSlug) {
      return this.verifyOrganization(organizationSlug, user);
    }

    const userId = request.params.id;
    if (userId) {
      const requestedUser = await this.usersService.findById(userId);
      return this.verifyOrganization(requestedUser.organization.slug, user);
    }

    return true;
  }

  verifyOrganization(organizationSlug: string, user: User) {
    const userOrganizationSlug = user.organization.slug;
    if (organizationSlug !== userOrganizationSlug) {
      throw new UnauthorizedException(
        'You are attempting to access information about an organization other than your own. You do not have sufficient permission to do this.',
      );
    }
    return true;
  }
}
