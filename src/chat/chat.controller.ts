import { Controller, ParseIntPipe, SerializeOptions } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { FindAllChatsDto } from './dto/find-all-chats.dto';
import { FindOneChatDto } from './dto/find-one-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@SerializeOptions({
  type: Chat,
})
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('createChat')
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createChatDto: CreateChatDto,
  ): Promise<Chat> {
    return this.chatService.create(projectId, createChatDto);
  }

  @MessagePattern('findAllChats')
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllChatsDto: FindAllChatsDto,
  ): Promise<Chat[]> {
    return this.chatService.findAll(projectId, findAllChatsDto);
  }

  @MessagePattern('findOneChat')
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findOneChatDto: FindOneChatDto,
  ): Promise<Chat> {
    return this.chatService.findOne(projectId, findOneChatDto);
  }

  @MessagePattern('updateChat')
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateChatDto: UpdateChatDto,
  ): Promise<Chat> {
    return this.chatService.update(projectId, updateChatDto);
  }

  @MessagePattern('removeChat')
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() removeChatDto: RemoveChatDto,
  ): Promise<Chat> {
    return this.chatService.remove(projectId, removeChatDto);
  }
}
