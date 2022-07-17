import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { User } from 'src/auth/user.decorator';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';
import { HsmService } from './hsm.service';

@Controller('hsm')
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Post()
  create(@User() user: any, @Body() createHsmDto: CreateHsmDto) {
    return this.hsmService.create(user.project.id, createHsmDto);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Get()
  findAll(@User() user: any) {
    return this.hsmService.findAll(user.project.id);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.hsmService.findOne(user.project.id, Number(id));
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(user.project.id, Number(id), updateHsmDto);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.hsmService.delete(user.project.id, Number(id));
  }
}
