import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor(
    readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRespository: Repository<User>
  ) { }

  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers();

    await this.insertNewProducts(firstUser);

    return 'Seed executed successfuly';
  }

  private async deleteTables() {

    // Borrar los productos
    await this.productsService.deleteAllProducts();

    // Borrar los usuarios
    const queryBuilder = this.userRespository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRespository.create({
        ...user,
        password: bcrypt.hashSync(user.password, 10)
      }))
    })

    await this.userRespository.save(users);
    return users[0];

  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertedPromised = [];
    products.forEach(product => {
      insertedPromised.push(this.productsService.create(product, user))
    })

    await Promise.all(insertedPromised)

    return true
  }

}
