import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user: any, @Body() createChatDto: CreateChatDto) {
    return this.chatService.create(user.project.id, createChatDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User() user: any, @Query('ids') ids?: string) {
    return this.chatService.findAll(
      user.project.id,
      ids?.split(',').map(Number),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.chatService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  createMessage(
    @User() user: any,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(
      user.project.id,
      Number(id),
      createMessageDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  findAllMessages(@User() user: any, @Param('id') id: string) {
    return this.messageService.findAll(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':chatId/messages/:id')
  updateMessage(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.update(
      user.project.id,
      Number(id),
      updateMessageDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':chatId/messages/:id')
  deleteMessage(@User() user: any, @Param('id') id: string) {
    return this.messageService.delete(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(user.project.id, Number(id), updateChatDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.chatService.delete(user.project.id, Number(id));
  }
}
