import {
  Controller,
  ParseIntPipe,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { FindOneMessageDto } from './dto/find-one-message.dto';
import { RemoveMessageDto } from './dto/remove-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { MessagingLimitGuard } from './guards/messaging-limit.guard';
import { MessageService } from './message.service';

@SerializeOptions({
  type: Message,
})
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('createMessage')
  @UseGuards(MessagingLimitGuard)
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createMessageDto: CreateMessageDto,
  ): Promise<Message[]> {
    return this.messageService.create(projectId, createMessageDto);
  }

  @MessagePattern('findAllMessages')
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllMessagesDto: FindAllMessagesDto,
  ): Promise<Message[]> {
    return this.messageService.findAll(projectId, findAllMessagesDto);
  }

  @MessagePattern('findOneMessage')
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findOneMessageDto: FindOneMessageDto,
  ): Promise<Message> {
    return this.messageService.findOne(projectId, findOneMessageDto);
  }

  @MessagePattern('updateMessage')
  @UseGuards(MessagingLimitGuard)
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(projectId, updateMessageDto);
  }

  @MessagePattern('removeMessage')
  @UseGuards(MessagingLimitGuard)
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() removeMessageDto: RemoveMessageDto,
  ): Promise<Message> {
    return this.messageService.remove(projectId, removeMessageDto);
  }
}
