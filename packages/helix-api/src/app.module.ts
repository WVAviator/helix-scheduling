import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'helix.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, //TODO: Remove this line when in production
      autoLoadEntities: true,
    }),
    ConfigModule.forRoot({
      envFilePath: ['../../.env'],
      isGlobal: true,
    }),
    OrganizationsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
