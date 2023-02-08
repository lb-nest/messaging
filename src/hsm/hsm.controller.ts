import { Controller, ParseIntPipe, SerializeOptions } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateHsmDto } from './dto/create-hsm.dto';
import { UpdateHsmDto } from './dto/update-hsm.dto';
import { Hsm } from './entities/hsm.entity';
import { HsmService } from './hsm.service';

@SerializeOptions({
  type: Hsm,
})
@Controller()
export class HsmController {
  constructor(private readonly hsmService: HsmService) {}

  @MessagePattern('createHsm')
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createHsmDto: CreateHsmDto,
  ): Promise<Hsm> {
    return this.hsmService.create(projectId, createHsmDto);
  }

  @MessagePattern('findAllHsm')
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
  ): Promise<Hsm[]> {
    return this.hsmService.findAll(projectId);
  }

  @MessagePattern('findOneHsm')
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Hsm> {
    return this.hsmService.findOne(projectId, id);
  }

  @MessagePattern('updateHsm')
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateHsmDto: UpdateHsmDto,
  ): Promise<Hsm> {
    return this.hsmService.update(projectId, updateHsmDto);
  }

  @MessagePattern('removeHsm')
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload('id', ParseIntPipe) id: number,
  ): Promise<Hsm> {
    return this.hsmService.remove(projectId, id);
  }
}
