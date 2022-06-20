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
  UseInterceptors,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Chat))
  @Post()
  create(@Auth() user: TokenPayload, @Body() createChatDto: CreateChatDto) {
    return this.chatService.create(user.project.id, createChatDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Chat))
  @Get()
  findAll(
    @Auth() user: TokenPayload,
    @Query('ids') ids?: string,
    @Query('orderBy') orderBy?: Prisma.SortOrder,
  ) {
    return this.chatService.findAll(
      user.project.id,
      ids?.split(',').map(Number),
      orderBy,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Chat))
  @Get(':id')
  findOne(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.chatService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Chat))
  @Patch(':id')
  update(
    @Auth() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(user.project.id, Number(id), updateChatDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Chat))
  @Delete(':id')
  delete(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.chatService.delete(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Message))
  @Post(':id/messages')
  createMessage(
    @Auth() user: TokenPayload,
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
  @UseInterceptors(new TransformInterceptor(Message))
  @Get(':id/messages')
  findAllMessages(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.messageService.findAll(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages/read')
  readMessages(
    @Auth() user: TokenPayload,
    @Param('id') id: string,
    @Body() readMessagesDto: ReadMessagesDto,
  ) {
    return this.messageService.readMessages(
      user.project.id,
      Number(id),
      readMessagesDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Message))
  @Patch(':chatId/messages/:id')
  updateMessage(
    @Auth() user: TokenPayload,
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
  @UseInterceptors(new TransformInterceptor(Message))
  @Delete(':chatId/messages/:id')
  deleteMessage(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.messageService.delete(user.project.id, Number(id));
  }
}
