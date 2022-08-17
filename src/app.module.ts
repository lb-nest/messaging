import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { HsmModule } from './hsm/hsm.module';
import { PrismaService } from './prisma.service';
import { BACKEND } from './shared/constants/broker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        PORT: Joi.number().default(8080),
        S3_ENDPOINT: Joi.string().uri().required(),
        S3_ACCESS_KEY: Joi.string().required(),
        S3_SECRET_KEY: Joi.string().required(),
        S3_BUCKET: Joi.string().required(),
        GS_USER: Joi.string().required(),
        GS_PASS: Joi.string().required(),
        MESSAGING_URL: Joi.string().uri().required(),
        WEBSOCKET_EDGE_URL: Joi.string().uri().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: BACKEND,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('BROKER_URL')],
            queue: `${BACKEND}_QUEUE`,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
    ChannelModule,
    ChatModule,
    HsmModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  exports: [ClientsModule],
})
export class AppModule {}
