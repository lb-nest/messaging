import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { FindOneMessageDto } from './dto/find-one-message.dto';
import { RemoveMessageDto } from './dto/remove-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('createMessage')
  create(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(projectId, createMessageDto);
  }

  @MessagePattern('findAllMessages')
  findAll(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findAllMessagesDto: FindAllMessagesDto,
  ) {
    return this.messageService.findAll(projectId, findAllMessagesDto);
  }

  @MessagePattern('findOneMessage')
  findOne(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() findOneMessageDto: FindOneMessageDto,
  ) {
    return this.messageService.findOne(projectId, findOneMessageDto);
  }

  @MessagePattern('updateMessage')
  update(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.update(projectId, updateMessageDto);
  }

  @MessagePattern('removeMessage')
  remove(
    @Payload('projectId', ParseIntPipe) projectId: number,
    @Payload() removeMessageDto: RemoveMessageDto,
  ) {
    return this.messageService.remove(projectId, removeMessageDto);
  }
}
