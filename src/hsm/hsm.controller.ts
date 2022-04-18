import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { HsmService } from './hsm.service';

@Controller('hsm')
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user: any, @Body() createHsmDto: CreateHsmDto) {
    return this.hsmService.create(user.project.id, createHsmDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User() user: any) {
    return this.hsmService.findAll(user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.hsmService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(user.project.id, Number(id), updateHsmDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.hsmService.delete(user.project.id, Number(id));
  }
}
