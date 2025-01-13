import { Injectable } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Prisma, PrismaClient, Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryEntity, CategoryCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create({
    createCategoryDto,
  }: {
    createCategoryDto: CreateCategoryDto;
  }): Promise<CategoryEntity> {
    try {
      // find all Categories with a name similar to the name provided
      const categoriesWithName = await this.prisma.category.findMany({
        where: {
          name: { contains: createCategoryDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const category of categoriesWithName) {
        // throw an error if a Category have the same name as the name provided
        if (
          category.name.toLowerCase() === createCategoryDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new Category
      const newCategory = await this.prisma.category.create({
        data: createCategoryDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'category-addition',
        data: newCategory,
      });

      return newCategory;
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
      // fetch all Categories with the specified parameters
      return await this.prisma.category.findMany({
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

  async countAll({
    where,
  }: {
    where?: Prisma.CategoryWhereInput;
  }): Promise<CategoryCountEntity> {
    try {
      // find all categories
      const categoriesCount = await this.prisma.category.count({ where });

      // return categories count
      return { count: categoriesCount };
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
    cursor?: Prisma.CategoryWhereUniqueInput;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<CategoryCountEntity> {
    try {
      // find specific categories
      const specificCategoriesCount = await this.prisma.category.count({
        skip: 0,
        take: (await this.countAll({ where })).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return categories count
      return { count: specificCategoriesCount };
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
    updateCategoryDto,
  }: {
    id: number;
    updateCategoryDto: UpdateCategoryDto;
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
        where: {
          name: { contains: updateCategoryDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const category of categoriesWithName) {
        // throw an error if a Category have the same name as the name provided
        if (
          category.name.toLowerCase() ===
            updateCategoryDto.name.toLowerCase() &&
          category.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the Category data
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: { ...updateCategoryDto, updatedAt: new Date().toISOString() },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'category-update',
        data: updatedCategory,
      });

      return updatedCategory;
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

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'category-deletion',
        data: category,
      });

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
