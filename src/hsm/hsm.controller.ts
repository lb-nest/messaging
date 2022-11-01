import {
  Controller,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from 'src/auth/auth.decorator';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';
import { HsmService } from './hsm.service';

@Controller()
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @MessagePattern('hsm.create')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  create(
    @Auth() auth: TokenPayload,
    @Payload('payload') createHsmDto: CreateHsmDto,
  ) {
    return this.hsmService.create(auth.project.id, createHsmDto);
  }

  @MessagePattern('hsm.findAll')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  findAll(@Auth() auth: TokenPayload) {
    return this.hsmService.findAll(auth.project.id);
  }

  @MessagePattern('hsm.findOne')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  findOne(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.hsmService.findOne(auth.project.id, id);
  }

  @MessagePattern('hsm.update')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  update(
    @Auth() auth: TokenPayload,
    @Payload('payload') updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(auth.project.id, updateHsmDto);
  }

  @MessagePattern('hsm.remove')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  remove(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.hsmService.remove(auth.project.id, id);
  }
}
