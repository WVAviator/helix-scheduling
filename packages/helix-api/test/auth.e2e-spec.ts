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
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .expect(201);
    const accessToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newUser.email, password: newUser.password })
        .expect(201)
    ).body.access_token;

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
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(newUser)
        .expect(201)
    ).body.user;

    await request(app.getHttpServer()).get('/users/me').send().expect(401);

    const accessToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newUser.email, password: newUser.password })
        .expect(201)
    ).body.access_token;

    const retrievedUser: User = (
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer ' + accessToken)
        .send()
        .expect(200)
    ).body.user;

    expect(retrievedUser).toEqual(signedUpUser);
  });
});
