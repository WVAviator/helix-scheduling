import { User } from './../users/entities/user.entity';
import { promisify } from 'util';
import { UsersService } from '../users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, organizationId } = createUserDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '$' + hash.toString('hex');

    const user = this.usersService.create({
      email,
      password: result,
      organizationId,
    });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email, {
      includePassword: true,
    });
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }

    const [salt, storedHash] = user.password.split('$');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  async login(user: User) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
      }),
    };
  }
}
