import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_data: Record<string, unknown>) {
    return { id: '' };
  }

  update(id: string, _data: Record<string, unknown>) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }

  assignRole(id: string, role: string) {
    return { id, role };
  }
}
