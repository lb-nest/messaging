import { Controller, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';
import { HsmService } from './hsm.service';

@Controller()
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @MessagePattern('createHsm')
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createHsmDto: CreateHsmDto,
  ) {
    return this.hsmService.create(projectId, createHsmDto);
  }

  @MessagePattern('findAllHsm')
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  findAll(@Payload('projectId', ParseIntPipe) projectId: number) {
    return this.hsmService.findAll(projectId);
  }

  @MessagePattern('findOneHsm')
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ) {
    return this.hsmService.findOne(projectId, id);
  }

  @MessagePattern('updateHsm')
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateHsmDto: UpdateHsmDto,
  ) {
    return this.hsmService.update(projectId, updateHsmDto);
  }

  @MessagePattern('removeHsm')
  @UseInterceptors(new PlainToClassInterceptor(Hsm))
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ) {
    return this.hsmService.remove(projectId, id);
  }
}
