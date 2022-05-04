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
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';
import { HsmService } from './hsm.service';

@Controller('hsm')
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Post()
  create(@Auth() user: TokenPayload, @Body() createHsmDto: CreateHsmDto) {
    return this.hsmService.create(user.project.id, createHsmDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Get()
  findAll(@Auth() user: TokenPayload) {
    return this.hsmService.findAll(user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Get(':id')
  findOne(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.hsmService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Patch(':id')
  update(
    @Auth() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(user.project.id, Number(id), updateHsmDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Hsm))
  @Delete(':id')
  delete(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.hsmService.delete(user.project.id, Number(id));
  }
}
