import { Injectable } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductCountEntity, ProductEntity } from './entities';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createProductDto,
  }: {
    createProductDto: CreateProductDto;
  }): Promise<ProductEntity> {
    try {
      // find all products with a name similar to the name provided
      const productWithName = await this.prisma.product.findMany({
        where: {
          name: { contains: createProductDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const product of productWithName) {
        // throw an error if a product have the same name as the name provided
        if (
          product.name.toLowerCase() === createProductDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new product
      return this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async findAll({
    skip,
    take,
    cursor,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<ProductEntity[]> {
    try {
      // fetch all products with the specified parameters
      return await this.prisma.product.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Records not found');
        }
      }
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async countAll(): Promise<ProductCountEntity> {
    try {
      // find all products
      const products = await this.prisma.product.findMany();

      // return products count
      return { count: products.length };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async countSpecific({
    skip,
    take,
    cursor,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<ProductCountEntity> {
    try {
      // find all product
      const product = await this.prisma.product.findMany();
      // find specific products
      const specificProducts = await this.prisma.product.findMany({
        skip: 0,
        take: product.length,
        cursor,
        where,
        orderBy,
      });

      // return products count
      return { count: specificProducts.length };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async findOne({ id }: { id: number }): Promise<ProductEntity> {
    try {
      // fetch product with the provided ID
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      // throw an error if any product is found
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // return the requested product
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async update({
    id,
    updateProductDto,
  }: {
    id: number;
    updateProductDto: UpdateProductDto;
  }): Promise<ProductEntity> {
    try {
      // fetch product with the provided ID
      const productWithID = await this.prisma.product.findUnique({
        where: { id },
      });

      // throw an error if any product is found
      if (!productWithID) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // find all product with a name to the name provided
      const productWithName = await this.prisma.product.findMany({
        where: {
          name: { contains: updateProductDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const product of productWithName) {
        // throw an error if a product have the same name as the name provided
        if (
          product.name.toLowerCase() === updateProductDto.name.toLowerCase() &&
          product.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the product data
      return await this.prisma.product.update({
        where: { id },
        data: { ...updateProductDto, updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async remove({ id }: { id: number }): Promise<ProductEntity> {
    try {
      // fetch product with the provided ID
      const productWithID = await this.prisma.product.findUnique({
        where: { id },
      });

      // throw an error if any product is found
      if (!productWithID) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // remove the specified product
      const product = await this.prisma.product.delete({
        where: { id },
      });

      // return removed product
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }
}
