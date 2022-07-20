import { UsersService } from 'src/users/users.service';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    console.log('Validating JWT strategy payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('Adding user to request:', user);
    if (!user) {
      return null;
    }
    return user;

    return { id: payload.sub, email: payload.username };
  }
}
