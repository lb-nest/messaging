import { Body, Controller, Param, Post } from '@nestjs/common';
import { WebchatEventDto } from './dto/webchat-event.dto';
import { WebchatService } from './webchat.service';

@Controller('webchat')
export class WebchatController {
  constructor(private readonly webchatService: WebchatService) {}

  @Post(':id/events')
  handleEvents(@Param('id') id: string, @Body() event: WebchatEventDto) {
    return this.webchatService.handleEvents(Number(id), event);
  }
}
