import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(_loginDto: LoginDto): Promise<{ accessToken: string }> {
    const payload = { sub: '', email: _loginDto.email, roles: [] };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(_registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const payload = {
      sub: '',
      email: _registerDto.email,
      roles: [],
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
