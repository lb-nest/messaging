import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  create(projectId: number, createChatDto: CreateChatDto) {
    return '';
  }

  findAll(projectId: number) {
    return '';
  }

  findOne(projectId: number, id: number) {
    return '';
  }

  update(projectId: number, id: number, updateChatDto: UpdateChatDto) {
    return '';
  }

  delete(projectId: number, id: number) {
    return '';
  }
}
