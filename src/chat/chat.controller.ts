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
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageService } from './message.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createChatDto: CreateChatDto) {
    return this.chatService.create(req.user.project.id, createChatDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.chatService.findAll(req.user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.chatService.findOne(req.user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  createMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(Number(id), createMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(
      req.user.project.id,
      Number(id),
      updateChatDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.chatService.delete(req.user.project.id, Number(id));
  }
}
