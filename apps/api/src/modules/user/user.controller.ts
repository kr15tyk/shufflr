import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/roles')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.userService.assignRole(id, dto.role);
  }
}
