import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { PublicUser } from '../users/users.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './types/authenticated-user.type';
import { JwtPayload } from './types/jwt-payload.type';

type AuthTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto): Promise<PublicUser> {
    const existingUser = await this.usersService.findByEmail(payload.email);

    if (existingUser) {
      throw new ConflictException('Email is already in use.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.usersService.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
    });

    return this.usersService.toPublic(user);
  }

  async login(payload: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
      token_type: 'Bearer',
    };
  }

  async me(authenticatedUser: AuthenticatedUser): Promise<PublicUser> {
    const user = await this.usersService.findById(authenticatedUser.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.usersService.toPublic(user);
  }
}

