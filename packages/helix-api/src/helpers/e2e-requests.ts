import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export const generateRequest = async (
  app: INestApplication,
  method: RequestMethod,
  path: string,
  body: any = null,
  token: string = null,
) => {
  let req = request(app.getHttpServer())[method](path);
  if (token) {
    req = req.set('Authorization', `Bearer ${token}`);
  }
  return body ? await req.send(body) : await req.send();
};
