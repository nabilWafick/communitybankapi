import { Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { Prisma, PrismaClient, Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    categoryDto,
  }: {
    categoryDto: CategoryDto;
  }): Promise<CategoryEntity> {
    try {
      // find all Categories with a name to the name provided
      const categoriesWithName = await this.prisma.category.findMany({
        where: { name: { contains: categoryDto.name, mode: 'insensitive' } },
      });

      // loop the result
      for (const category of categoriesWithName) {
        // throw an error if a Category have the same name as the name provided
        if (category.name.toLowerCase() === categoryDto.name.toLowerCase()) {
          throw new Error('Name already used');
        }
      }

      // create a new Category
      return this.prisma.category.create({
        data: categoryDto,
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
    cursor?: Prisma.CategoryWhereUniqueInput;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<CategoryEntity[]> {
    try {
      // fetch all Categorys with the specified parameters
      return await this.prisma.category.findMany({
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

  async findOne({ id }: { id: number }): Promise<CategoryEntity> {
    try {
      // fetch Category with the provided ID
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      // throw an error if any Category is found
      if (!category) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // return the requested Category
      return category;
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
    categoryDto,
  }: {
    id: number;
    categoryDto: CategoryDto;
  }): Promise<CategoryEntity> {
    try {
      // fetch Category with the provided ID
      const categoryWithID = await this.prisma.category.findUnique({
        where: { id },
      });

      // throw an error if any Category is found
      if (!categoryWithID) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // find all Categories with a name to the name provided
      const categoriesWithName = await this.prisma.category.findMany({
        where: { name: { contains: categoryDto.name, mode: 'insensitive' } },
      });

      // loop the result
      for (const category of categoriesWithName) {
        // throw an error if a Category have the same name as the name provided
        if (
          category.name.toLowerCase() === CategoryDto.name.toLowerCase() &&
          category.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the Category data
      return await this.prisma.category.update({
        where: { id },
        data: CategoryDto,
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

  async remove({ id }: { id: number }): Promise<CategoryEntity> {
    try {
      // fetch Category with the provided ID
      const categoryWithID = await this.prisma.category.findUnique({
        where: { id },
      });

      // throw an error if any Category is found
      if (!categoryWithID) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // remove the specified Category
      const category = await this.prisma.category.delete({ where: { id } });

      // return removed Category
      return category;
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
