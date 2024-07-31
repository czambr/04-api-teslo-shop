import { Response } from 'express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';


@ApiTags('Uploads Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('/product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const path = this.filesService.getStaticProductImage(imageName)
    return res.sendFile(path)
  }

  @Post('/product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products', // hacemos referencia al root del proyecto con el punto
      filename: fileNamer
    })
  }))
  uploadProductFiles(
    @UploadedFile() file: Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException('Make sure that file is an image')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    }
  }



}
