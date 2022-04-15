import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { HsmService } from './hsm.service';

@Controller('template-messages')
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createHsmDto: CreateHsmDto) {
    return this.hsmService.create(req.user.project.id, createHsmDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.hsmService.findAll(req.user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.hsmService.findOne(req.user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(
      req.user.project.id,
      Number(id),
      updateHsmDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.hsmService.delete(req.user.project.id, Number(id));
  }
}
