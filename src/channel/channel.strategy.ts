import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';

export abstract class ChannelStrategy {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly configService: ConfigService,
  ) {}

  abstract create(
    projectId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<any>;
}
