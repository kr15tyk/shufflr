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
import { CourtService } from './court.service';
import { CreateCourtDto, UpdateCourtDto } from './dto/court.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('courts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  findAll() {
    return this.courtService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courtService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  create(@Body() dto: CreateCourtDto) {
    return this.courtService.create(dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCourtDto) {
    return this.courtService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  remove(@Param('id') id: string) {
    return this.courtService.remove(id);
  }
}
