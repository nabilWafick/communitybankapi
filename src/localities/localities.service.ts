import { Injectable } from '@nestjs/common';
import { CreateLocalityDto, UpdateLocalityDto } from './dto';
import { Prisma, PrismaClient, Locality } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocalityEntity, LocalityCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class LocalitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create({
    createLocalityDto,
  }: {
    createLocalityDto: CreateLocalityDto;
  }): Promise<LocalityEntity> {
    try {
      // find all localities with a name similar to the name provided
      const localitiesWithName = await this.prisma.locality.findMany({
        where: {
          name: { contains: createLocalityDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const locality of localitiesWithName) {
        // throw an error if a locality have the same name as the name provided
        if (
          locality.name.toLowerCase() === createLocalityDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new locality
      const newLocality = await this.prisma.locality.create({
        data: createLocalityDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'locality-addition',
        data: newLocality,
      });

      return newLocality;
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
    cursor?: Prisma.LocalityWhereUniqueInput;
    where?: Prisma.LocalityWhereInput;
    orderBy?: Prisma.LocalityOrderByWithRelationInput;
  }): Promise<LocalityEntity[]> {
    try {
      // fetch all localitys with the specified parameters
      return await this.prisma.locality.findMany({
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
    where?: Prisma.LocalityWhereInput;
  }): Promise<LocalityCountEntity> {
    try {
      // find all localities
      const localitiesCount = await this.prisma.locality.count({ where });

      // return localities count
      return { count: localitiesCount };
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
    cursor?: Prisma.LocalityWhereUniqueInput;
    where?: Prisma.LocalityWhereInput;
    orderBy?: Prisma.LocalityOrderByWithRelationInput;
  }): Promise<LocalityCountEntity> {
    try {
      // find specific localities
      const specificLocalitiesCount = await this.prisma.locality.count({
        skip: 0,
        take: (await this.countAll({ where })).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return localities count
      return { count: specificLocalitiesCount };
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

  async findOne({ id }: { id: number }): Promise<LocalityEntity> {
    try {
      // fetch locality with the provided ID
      const locality = await this.prisma.locality.findUnique({
        where: { id },
      });

      // throw an error if any locality is found
      if (!locality) {
        throw new Error(`Locality with ID ${id} not found`);
      }

      // return the requested locality
      return locality;
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
    updateLocalityDto,
  }: {
    id: number;
    updateLocalityDto: UpdateLocalityDto;
  }): Promise<LocalityEntity> {
    try {
      // fetch locality with the provided ID
      const localityWithID = await this.prisma.locality.findUnique({
        where: { id },
      });

      // throw an error if any locality is found
      if (!localityWithID) {
        throw new Error(`Locality with ID ${id} not found`);
      }

      // find all localities with a name to the name provided
      const localitiesWithName = await this.prisma.locality.findMany({
        where: {
          name: { contains: updateLocalityDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const locality of localitiesWithName) {
        // throw an error if a locality have the same name as the name provided
        if (
          locality.name.toLowerCase() ===
            updateLocalityDto.name.toLowerCase() &&
          locality.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the locality data
      const updatedLocality = await this.prisma.locality.update({
        where: { id },
        data: { ...updateLocalityDto, updatedAt: new Date().toISOString() },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'locality-update',
        data: updatedLocality,
      });

      return updatedLocality;
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

  async remove({ id }: { id: number }): Promise<LocalityEntity> {
    try {
      // fetch locality with the provided ID
      const localityWithID = await this.prisma.locality.findUnique({
        where: { id },
      });

      // throw an error if any locality is found
      if (!localityWithID) {
        throw new Error(`Locality with ID ${id} not found`);
      }

      // remove the specified locality
      const locality = await this.prisma.locality.delete({ where: { id } });

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'locality-deletion',
        data: locality,
      });

      // return removed locality
      return locality;
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
