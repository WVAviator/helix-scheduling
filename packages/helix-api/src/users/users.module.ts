import { OrganizationsModule } from '../organizations/organizations.module';
import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), OrganizationsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
