import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Auth } from 'src/auth/auth.decorator';
import { TokenPayload } from 'src/auth/entities/token-payload.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { Webhook } from './entities/webhook.entity';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Post()
  create(
    @Auth() user: TokenPayload,
    @Body() createWebhookDto: CreateWebhookDto,
  ) {
    return this.webhookService.create(user.project.id, createWebhookDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Get()
  findAll(@Auth() user: TokenPayload) {
    return this.webhookService.findAll(user.project.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Get(':id')
  findOne(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.webhookService.findOne(user.project.id, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Patch(':id')
  update(
    @Auth() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
  ) {
    return this.webhookService.update(
      user.project.id,
      Number(id),
      updateWebhookDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Delete(':id')
  delete(@Auth() user: TokenPayload, @Param('id') id: string) {
    return this.webhookService.delete(user.project.id, Number(id));
  }
}
