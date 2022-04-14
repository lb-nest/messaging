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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTemplateMessageDto } from './dto/create-template-message.dto';
import { UpdateTemplateMessageDto } from './dto/update-template-message.dto';
import { TemplateMessageService } from './template-message.service';

@Controller('template-messages')
export class TemplateMessageController {
  constructor(
    private readonly templateMessageService: TemplateMessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createTemplateDto: CreateTemplateMessageDto) {
    return this.templateMessageService.create(
      req.user.project.id,
      createTemplateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.templateMessageService.findAll(req.user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.templateMessageService.findOne(req.user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateMessageDto,
  ) {
    return this.templateMessageService.update(
      req.user.project.id,
      Number(id),
      updateTemplateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.templateMessageService.delete(req.user.project.id, Number(id));
  }
}
