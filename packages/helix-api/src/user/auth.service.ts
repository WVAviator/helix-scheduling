import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, title, password, organizationId } = createUserDto;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '$' + hash.toString('hex');

    const user = this.userService.create({
      name,
      email,
      title,
      password: result,
      organizationId,
    });
    return user;
  }

  async authenticate(email: string, password: string) {
    const user = await this.userService.findByEmail(email, {
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
}
