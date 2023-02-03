import {
  Controller,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlainToClassInterceptor } from 'src/shared/interceptors/plain-to-class.interceptor';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { FindOneMessageDto } from './dto/find-one-message.dto';
import { RemoveMessageDto } from './dto/remove-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { MessagingLimitGuard } from './guards/messaging-limit.guard';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('createMessage')
  @UseGuards(MessagingLimitGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createMessageDto: CreateMessageDto,
  ): Promise<Message[]> {
    return this.messageService.create(projectId, createMessageDto);
  }

  @MessagePattern('findAllMessages')
  @UseInterceptors(new PlainToClassInterceptor(Message))
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllMessagesDto: FindAllMessagesDto,
  ): Promise<Message[]> {
    return this.messageService.findAll(projectId, findAllMessagesDto);
  }

  @MessagePattern('findOneMessage')
  @UseInterceptors(new PlainToClassInterceptor(Message))
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findOneMessageDto: FindOneMessageDto,
  ): Promise<Message> {
    return this.messageService.findOne(projectId, findOneMessageDto);
  }

  @MessagePattern('updateMessage')
  @UseGuards(MessagingLimitGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(projectId, updateMessageDto);
  }

  @MessagePattern('removeMessage')
  @UseGuards(MessagingLimitGuard)
  @UseInterceptors(new PlainToClassInterceptor(Message))
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() removeMessageDto: RemoveMessageDto,
  ): Promise<Message> {
    return this.messageService.remove(projectId, removeMessageDto);
  }
}
