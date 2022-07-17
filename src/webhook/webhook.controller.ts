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
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { User } from 'src/auth/user.decorator';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { Webhook } from './entities/webhook.entity';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Post()
  create(@User() user: any, @Body() createWebhookDto: CreateWebhookDto) {
    return this.webhookService.create(user.project.id, createWebhookDto);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Get()
  findAll(@User() user: any) {
    return this.webhookService.findAll(user.project.id);
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.webhookService.findOne(user.project.id, Number(id));
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
  ) {
    return this.webhookService.update(
      user.project.id,
      Number(id),
      updateWebhookDto,
    );
  }

  @UseGuards(BearerAuthGuard)
  @UseInterceptors(new TransformInterceptor(Webhook))
  @Delete(':id')
  delete(@User() user: any, @Param('id') id: string) {
    return this.webhookService.delete(user.project.id, Number(id));
  }
}
