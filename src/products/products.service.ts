import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('Product Service')

  // ===> Centralizar el manejo de errores
  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSorce: DataSource
  ) { }



  async create(createProductDto: CreateProductDto, user: User) {

    try {
      // ===> Crea la instancia del producto
      //      por cada registro que se desee grabar
      const { images = [], ...productDeatils } = createProductDto;
      const product = this.productRepository.create({
        ...productDeatils,
        images: images.map((image) => this.productImageRepository.create({ url: image })),
        user: user
      })

      // ===> Impacta la base de datos
      await this.productRepository.save(product)
      return { ...product, images }
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,

        // Relaciones
        relations: {
          images: true
        }
      })
      return products.map((product) => ({
        ...product,
        images: product.images.map(img => img.url)
      }))
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toLocaleUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if (!product) throw new BadRequestException(`Product with term ${term} not found`)
    return product
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map((img) => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    // Create query runner
    const queryRunner = this.dataSorce.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // Empezamos a mapear las transacciones que se haran

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id: id } });
        product.images = images.map(
          img => this.productImageRepository.create({ url: img })
        )
      };

      product.user = user;
      await queryRunner.manager.save(product); // intenta grabar, esto puede fallar. No impacta la DB
      await queryRunner.commitTransaction(); // Hace commit de la transaccion (impacta la DB)
      await queryRunner.release(); // Cierra la conexion del release

      // await this.productRepository.save(product)
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction() // En caso de que algo salga mal, se realiza el roll back de las transacciones
      await queryRunner.release() // Cerramos la conexion del query runner
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch (error) {
      this.handleExceptions(error)
    }
  }
}
