import { ShiftsModule } from './../src/shifts/shifts.module';
import { AuthModule } from './../src/auth/auth.module';
import { UsersModule } from './../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { generateRequest } from './../src/helpers/e2e-requests';
import { Role } from './../src/rbac/role.enum';
import { Shift } from './../src/shifts/entities/shift.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/users/entities/user.entity';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';

describe('AuthController e2e', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['../../.env'],
          isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        ShiftsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'e2e.sqlite',
          entities: [User, Shift],
          logging: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });

  afterEach(async () => {
    await usersRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  const retrieveAccessToken = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    const { body } = await generateRequest(app, 'post', '/auth/login', {
      email,
      password,
    });
    return body.access_token;
  };

  it('should not allow login if the user does not exist', async () => {
    const res = await generateRequest(app, 'post', '/auth/login', {
      email: 'abcdefg@abcdefg.com',
      password: 'test',
    });
    expect(res.status).toEqual(401);
  });

  it('should allow creating and logging in a user', async () => {
    const newUser = {
      email: 'abc123@abc.com',
      password: 'Awkward57!',
      firstName: 'Joe',
      lastName: 'Test',
    };

    await generateRequest(app, 'post', '/auth/signup', newUser);

    const accessToken = await retrieveAccessToken(
      newUser.email,
      newUser.password,
    );

    expect(accessToken).toBeDefined();
  });

  it('should not allow access to guarded routes unless signed in', async () => {
    const newUser = {
      email: 'abc123@abc.com',
      password: 'Awkward57!',
      firstName: 'Joe',
      lastName: 'Test',
    };

    const signedUpUser = (
      await generateRequest(app, 'post', '/auth/signup', newUser)
    ).body;

    expect((await generateRequest(app, 'get', '/users/me')).status).toEqual(
      401,
    );

    const accessToken = await retrieveAccessToken(
      newUser.email,
      newUser.password,
    );

    const retrievedUser = (
      await generateRequest(app, 'get', '/users/me', null, accessToken)
    ).body;

    expect(retrievedUser.id).toEqual(signedUpUser.id);
  });

  it('deleting users requires admin priviliges', async () => {
    const adminUser = {
      email: 'abc123@abc.com',
      password: 'Awkward57!',
      firstName: 'Joe',
      lastName: 'Test',
    };
    const deleteUser = {
      email: 'deleteme@abc.com',
      password: 'Awkward57!',
      firstName: 'Don',
      lastName: 'Test',
    };
    const adminUserSaved = (
      await generateRequest(app, 'post', '/auth/signup', adminUser)
    ).body;
    const deleteUserSaved = (
      await generateRequest(app, 'post', '/auth/signup', deleteUser)
    ).body;

    const accessToken = await retrieveAccessToken(
      adminUser.email,
      adminUser.password,
    );
    const deleteAttemptResponse = await generateRequest(
      app,
      'delete',
      `/users/${deleteUserSaved.id}`,
      null,
      accessToken,
    );
    expect(deleteAttemptResponse.status).toEqual(403);

    await usersRepository.save({ ...adminUserSaved, role: Role.ADMIN });

    const deleteAttemptResponse2 = await generateRequest(
      app,
      'delete',
      `/users/${deleteUserSaved.id}`,
      null,
      accessToken,
    );
    expect(deleteAttemptResponse2.status).toEqual(200);

    const retrievedUserResponse = await generateRequest(
      app,
      'get',
      `/users/${deleteUserSaved.id}`,
      null,
      accessToken,
    );
    expect(retrievedUserResponse.status).toEqual(404);
  });
});
