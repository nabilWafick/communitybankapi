import { Injectable } from '@nestjs/common';
import { TypeDto } from './dto/type.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeEntity } from './entities/type.entity';

@Injectable()
export class TypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ typeDto }: { typeDto: TypeDto }): Promise<TypeEntity> {
    try {
      // find all types  with a name similar to the name provided
      const typeWithName = await this.prisma.type.findMany({
        where: {
          name: { contains: typeDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const type of typeWithName) {
        // throw an error if a type have the same name as the name provided
        if (type.name.toLowerCase() === typeDto.name.toLowerCase()) {
          throw new Error('Name already used');
        }
      }

      // check if products ids are not repeated and related products exist
      for (const productId of typeDto.productsIds) {
        let repetiton = 0;

        for (let i = 0; i < typeDto.productsIds.length; i++) {
          if (productId == typeDto.productsIds[i]) {
            ++repetiton;
          }
        }

        if (repetiton > 1) {
          throw Error('Repeated ID');
        } else {
          const product = await this.prisma.product.findUnique({
            where: { id: productId },
          });

          if (!product) {
            throw Error(`Product not found`);
          }
        }
      }

      // create a new type
      return this.prisma.type.create({
        data: typeDto,
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
    cursor?: Prisma.TypeWhereUniqueInput;
    where?: Prisma.TypeWhereInput;
    orderBy?: Prisma.TypeOrderByWithRelationInput;
  }): Promise<TypeEntity[]> {
    try {
      // fetch all types with the specified parameters
      return await this.prisma.type.findMany({
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

  async findOne({ id }: { id: number }): Promise<TypeEntity> {
    try {
      // fetch type with the provided ID
      const type = await this.prisma.type.findUnique({
        where: { id },
      });

      // throw an error if any type is found
      if (!type) {
        throw new Error(`Type with ID ${id} not found`);
      }

      // return the requested type
      return type;
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
    typeDto,
  }: {
    id: number;
    typeDto: TypeDto;
  }): Promise<TypeEntity> {
    try {
      // fetch type with the provided ID
      const typeWithID = await this.prisma.type.findUnique({
        where: { id },
      });

      // throw an error if any type is found
      if (!typeWithID) {
        throw new Error(`Type with ID ${id} not found`);
      }

      // find all type with a name to the name provided
      const typeWithName = await this.prisma.type.findMany({
        where: {
          name: { contains: typeDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const type of typeWithName) {
        // throw an error if a type have the same name as the name provided
        if (
          type.name.toLowerCase() === typeDto.name.toLowerCase() &&
          type.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // check if products ids are not repeated and related products exist
      for (const productId of typeDto.productsIds) {
        let repetiton = 0;

        for (let i = 0; i < typeDto.productsIds.length; i++) {
          if (productId == typeDto.productsIds[i]) {
            ++repetiton;
          }
        }

        if (repetiton > 1) {
          throw Error('Repeated ID');
        } else {
          const product = await this.prisma.product.findUnique({
            where: { id: productId },
          });

          if (!product) {
            throw Error(`Product not found`);
          }
        }
      }

      // update the type data
      return await this.prisma.type.update({
        where: { id },
        data: typeDto,
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

  async remove({ id }: { id: number }): Promise<TypeEntity> {
    try {
      // fetch type with the provided ID
      const typeWithID = await this.prisma.type.findUnique({
        where: { id },
      });

      // throw an error if any type is found
      if (!typeWithID) {
        throw new Error(`Type with ID ${id} not found`);
      }

      // remove the specified type
      const type = await this.prisma.type.delete({
        where: { id },
      });

      // return removed type
      return type;
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
