import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ChannelStrategy } from './channel.strategy';
import { CreateChannelDto } from './dto/create-channel.dto';

export class WhatsappStrategy implements ChannelStrategy {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly configService: ConfigService,
  ) {}

  create(projectId: number, createChannelDto: CreateChannelDto): Promise<any> {
    throw new NotImplementedException();
  }
}
