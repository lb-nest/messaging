import { Controller, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { FindAllChatsDto } from './dto/find-all-chats.dto';
import { FindOneChatDto } from './dto/find-one-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('createChat')
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(projectId, createChatDto);
  }

  @MessagePattern('findAllChats')
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllChatsDto: FindAllChatsDto,
  ) {
    return this.chatService.findAll(projectId, findAllChatsDto);
  }

  @MessagePattern('findOneChat')
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findOneChatDto: FindOneChatDto,
  ) {
    return this.chatService.findOne(projectId, findOneChatDto);
  }

  @MessagePattern('updateChat')
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(projectId, updateChatDto);
  }

  @MessagePattern('removeChat')
  @UseInterceptors(new PlainToClassInterceptor(Chat))
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() removeChatDto: RemoveChatDto,
  ) {
    return this.chatService.remove(projectId, removeChatDto);
  }
}
