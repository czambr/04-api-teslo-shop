import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'c78123ec-7fc5-401b-91ec-a806bb1bb1ff',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column('text', { unique: true })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product price',
        default: 0
    })
    @Column('float', { default: 0 })
    price: number

    @ApiProperty({
        example: 'Lorem Ipmsu',
        description: 'Product description',
        default: null,
    })
    @Column({ type: 'text', nullable: true })
    description: string

    @ApiProperty({
        example: 't_shirt_slug',
        description: 'Product SLUG',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0,
    })
    @Column('int', { default: 0 })
    stock: number

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product Sizes',
    })
    @Column('text', { array: true })
    sizes: string[]

    @ApiProperty({
        example: 'Women',
        description: 'Product Gender'
    })
    @Column('text')
    gender: string

    // ==== TAGS
    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // ===> Relations
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User




    // ==== Actions 
    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) this.slug = this.title;
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}
