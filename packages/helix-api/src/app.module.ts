import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ShiftsModule } from './shifts/shifts.module';

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
    UsersModule,
    AuthModule,
    ShiftsModule,
  ],
})
export class AppModule {}
