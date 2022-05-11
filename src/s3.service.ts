import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import contentDisposition from 'content-disposition';
import { Stream } from 'stream';
import * as uuid from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  constructor(configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: configService.get<string>('S3_SECRET_KEY'),
      },
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async upload(
    body: Buffer | Stream,
    fileName?: string,
    mimeType?: string,
  ): Promise<string> {
    const res = await this.s3
      .upload({
        Bucket: 'leadball-next',
        Key: uuid.v4(),
        ContentType: mimeType,
        ContentDisposition: fileName && contentDisposition(fileName),
        Body: body,
      })
      .promise();

    return res.Location;
  }
}
