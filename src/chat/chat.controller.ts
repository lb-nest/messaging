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
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindAllChatsDto } from './dto/find-all-chats.dto';
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

  @MessagePattern('chats.create')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  create(
    @Auth() auth: TokenPayload,
    @Payload('payload') createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(auth.project.id, createChatDto);
  }

  @MessagePattern('chats.findAll')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  findAll(
    @Auth() auth: TokenPayload,
    @Payload('payload') findAllChatsDto: FindAllChatsDto,
  ) {
    return this.chatService.findAll(auth.project.id, findAllChatsDto);
  }

  @MessagePattern('chats.findOne')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  findOne(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.chatService.findOne(auth.project.id, id);
  }

  @MessagePattern('chats.update')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  update(
    @Auth() auth: TokenPayload,
    @Payload('payload') updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(auth.project.id, updateChatDto);
  }

  @MessagePattern('remove')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  remove(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.chatService.remove(auth.project.id, id);
  }

  @MessagePattern('chats.createMessage')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  createMessage(
    @Auth() auth: TokenPayload,
    @Payload('payload') createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(auth.project.id, createMessageDto);
  }

  @MessagePattern('chats.findAllMessages')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  findAllMessages(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.messageService.findAll(auth.project.id, id);
  }

  @MessagePattern('chats.markMessagesAsRead')
  @UseGuards(BearerAuthGuard)
  markMessagesAsRead(
    @Auth() auth: TokenPayload,
    @Payload('payload') readMessagesDto: ReadMessagesDto,
  ) {
    return this.messageService.markAsRead(auth.project.id, readMessagesDto);
  }

  @MessagePattern('chats.updateMessage')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  updateMessage(
    @Auth() auth: TokenPayload,
    @Payload('payload') updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.update(auth.project.id, updateMessageDto);
  }

  @MessagePattern('chats.removeMessage')
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  deleteMessage(
    @Auth() auth: TokenPayload,
    @Payload('payload', ParseIntPipe) id: number,
  ) {
    return this.messageService.remove(auth.project.id, id);
  }
}
