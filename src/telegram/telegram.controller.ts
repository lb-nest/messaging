import { Body, Controller, Param, Post } from '@nestjs/common';
import { TelegramEventDto } from './dto/telegram-event.dto';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post(':id/events')
  handleEvents(@Param('id') id: string, @Body() event: TelegramEventDto) {
    return this.telegramService.handleEvents(Number(id), event);
  }
}
