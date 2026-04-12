import { Injectable, NotImplementedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(_loginDto: LoginDto): Promise<{ accessToken: string }> {
    throw new NotImplementedException(
      'login is not implemented until user storage is wired up',
    );
  }

  async register(_registerDto: RegisterDto): Promise<{ accessToken: string }> {
    throw new NotImplementedException(
      'register is not implemented until user storage is wired up',
    );
  }
}
