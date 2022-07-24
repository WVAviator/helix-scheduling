import { Shift } from './../src/shifts/entities/shift.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/users/entities/user.entity';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';

describe('AuthController e2e', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'e2etest.sqlite',
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

  it('should not allow login if the user does not exist', async () => {
    const email = `abcdefg@abcdefg.com`;
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'test' })
      .expect(401);
  });

  it('should allow creating and logging in a user', async () => {
    const newUser = {
      email: 'abc123@abc.com',
      password: 'Awkward57!',
      firstName: 'Joe',
      lastName: 'Test',
    };
    const signUpResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .expect(201);
    const logInResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: newUser.email, password: newUser.password })
      .expect(201);

    console.log(signUpResponse);
    console.log(logInResponse);

    const signUpResponseData = JSON.parse(signUpResponse.text);
    const logInResponseData = JSON.parse(logInResponse.text);

    expect(logInResponseData.access_token).toBeDefined();
  });
});
