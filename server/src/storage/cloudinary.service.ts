import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export type UploadedFileMeta = {
  url: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file.buffer) {
      throw new InternalServerErrorException('File buffer is missing');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `kanban/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadFiles(files: Express.Multer.File[], folder: string): Promise<UploadedFileMeta[]> {
    return Promise.all(
      files.map(async (file) => ({
        url: await this.uploadFile(file, folder),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })),
    );
  }
}
