import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_POSTGRES_HOST,
      port: +process.env.DB_POSTGRES_PORT,
      database: process.env.DB_POSTGRES_NAME,
      username: process.env.DB_POSTGRES_USER_NAME,
      password: process.env.DB_POSTGRES_PASSWORD,
      autoLoadEntities: true, // Para que cargue directamente las entidades
      synchronize: true, // Automaticamente sincroniza los cambios de la base de datos
    }),
    CommonModule,
    ProductsModule,
    SeedModule,
    FilesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
