import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { HsmModule } from './hsm/hsm.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        PORT: Joi.number().default(8080),
        SECRET: Joi.string().required(),
        S3_ENDPOINT: Joi.string().uri().required(),
        S3_ACCESS_KEY: Joi.string().required(),
        S3_SECRET_KEY: Joi.string().required(),
        S3_BUCKET: Joi.string().required(),
        GS_USR: Joi.string().required(),
        GS_PWD: Joi.string().required(),
        AUTHORIZATION_URL: Joi.string().uri().required(),
        MESSAGING_URL: Joi.string().uri().required(),
        WEBSOCKET_EDGE_URL: Joi.string().uri().required(),
      }),
    }),
    AuthModule,
    ChannelModule,
    ChatModule,
    HsmModule,
    WebhookModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
