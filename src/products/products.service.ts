import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductCountEntity, ProductEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

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
      const newProduct = await this.prisma.product.create({
        data: createProductDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'product-addition',
        data: newProduct,
      });

      return newProduct;
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
        where: transformWhereInput(where),
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
      const productsCount = await this.prisma.product.count();

      // return products count
      return { count: productsCount };
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
      // find specific products
      const specificProductsCount = await this.prisma.product.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return products count
      return { count: specificProductsCount };
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

  /*
  async poupulateTypeProduct() {
    try {
      const types = await this.prisma.type.findMany({});

      const products = await this.prisma.product.findMany({});

      // try population

      for (const type of types) {
        for (const productId of type.productsIds) {
          // find the corresponding product
          const product = products.find((prod) => prod.id === productId);

          if (product) {
            // create type product

            const newTypeProduct = await this.prisma.typeProduct.create({
              data: {
                typeId: type.id,
                productId: product.id,
                productNumber:
                  type.productsNumbers[type.productsIds.indexOf(product.id)],
              },
            });

            if (newTypeProduct) {
              console.log('New Type product created');
            }
          }
        }
      }

      return types;
      // return the requested product
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
*/

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
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: { ...updateProductDto, updatedAt: new Date().toISOString() },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'product-update',
        data: updatedProduct,
      });

      return updatedProduct;
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

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'product-deletion',
        data: product,
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

  private validateParam(value: any): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }

  async getProductsForecasts({
    productId,
    customerId,
    collectorId,
    cardId,
    typeId,
    totalSettlementNumber,
  }: {
    productId?: number;
    customerId?: number;
    collectorId?: number;
    cardId?: number;
    typeId?: number;
    totalSettlementNumber?: number;
  }) {
    try {
      const params = [
        { name: 'p_product_id', value: productId },
        { name: 'p_customer_id', value: customerId },
        { name: 'p_collector_id', value: collectorId },
        { name: 'p_card_id', value: cardId },
        { name: 'p_type_id', value: typeId },
        { name: 'p_total_settlement_number', value: totalSettlementNumber },
      ].filter(
        (param) => param.value !== undefined && this.validateParam(param.value),
      );
      const paramString = params
        .map((param) => `${param.name} := ${param.value}`)
        .join(', ');

      const query = `SELECT * FROM get_products_forecasts(${paramString})`;

      const result = await this.prisma.$queryRawUnsafe(query);
      console.log('### RESULT ###');

      console.log(result);

      return result;
    } catch (error) {
      console.error('Error calling get_product_forecast:', error);
      throw error;
    }
  }
}
