import { Injectable } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateUserDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateUserDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }

  assignRole(id: string, role: Role) {
    return { id, role };
  }
}
