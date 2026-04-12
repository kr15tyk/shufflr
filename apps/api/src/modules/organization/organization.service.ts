import { Injectable } from '@nestjs/common';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateOrganizationDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateOrganizationDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
