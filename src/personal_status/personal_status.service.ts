import { Injectable } from '@nestjs/common';
import { CreatePersonalStatusDto, UpdatePersonalStatusDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonalStatusEntity, PersonalStatusCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';
import { retry } from 'rxjs';

@Injectable()
export class PersonalStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create({
    createPersonalStatusDto,
  }: {
    createPersonalStatusDto: CreatePersonalStatusDto;
  }): Promise<PersonalStatusEntity> {
    try {
      // find all personalStatus with a name similar to the name provided
      const personalStatusWithName = await this.prisma.personalStatus.findMany({
        where: {
          name: { contains: createPersonalStatusDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const personalStatus of personalStatusWithName) {
        // throw an error if a personalStatus have the same name as the name provided
        if (
          personalStatus.name.toLowerCase() ===
          createPersonalStatusDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new personalStatus
      const newPersonalStatus = await this.prisma.personalStatus.create({
        data: createPersonalStatusDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'personalStatus-addition',
        data: newPersonalStatus,
      });

      return newPersonalStatus;
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
    cursor?: Prisma.PersonalStatusWhereUniqueInput;
    where?: Prisma.PersonalStatusWhereInput;
    orderBy?: Prisma.PersonalStatusOrderByWithRelationInput;
  }): Promise<PersonalStatusEntity[]> {
    try {
      // fetch all personalStatuss with the specified parameters
      return await this.prisma.personalStatus.findMany({
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
    where?: Prisma.PersonalStatusWhereInput;
  }): Promise<PersonalStatusCountEntity> {
    try {
      // find all personalStatuss
      const personalStatusCount = await this.prisma.personalStatus.count({
        where,
      });

      // return personalStatuss count
      return { count: personalStatusCount };
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
    cursor?: Prisma.PersonalStatusWhereUniqueInput;
    where?: Prisma.PersonalStatusWhereInput;
    orderBy?: Prisma.PersonalStatusOrderByWithRelationInput;
  }): Promise<PersonalStatusCountEntity> {
    try {
      // find specific personalStatuss
      const specificPersonalStatusCount =
        await this.prisma.personalStatus.count({
          skip: 0,
          take: (await this.countAll({ where })).count,
          cursor,
          where: transformWhereInput(where),
          orderBy,
        });

      // return personalStatus count
      return { count: specificPersonalStatusCount };
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

  async findOne({ id }: { id: number }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatus = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatus) {
        throw new Error(`Personal Status with ID ${id} not found`);
      }

      // return the requested personalStatus
      return personalStatus;
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
    updatePersonalStatusDto,
  }: {
    id: number;
    updatePersonalStatusDto: UpdatePersonalStatusDto;
  }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatusWithID = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatusWithID) {
        throw new Error(`Personal Status with ID ${id} not found`);
      }

      // find all personalStatus with a name to the name provided
      const personalStatusWithName = await this.prisma.personalStatus.findMany({
        where: {
          name: { contains: updatePersonalStatusDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const personalStatus of personalStatusWithName) {
        // throw an error if a personalStatus have the same name as the name provided
        if (
          personalStatus.name.toLowerCase() ===
            updatePersonalStatusDto.name.toLowerCase() &&
          personalStatus.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the personalStatus data
      const updatedPersonalStatus = await this.prisma.personalStatus.update({
        where: { id },
        data: {
          ...updatePersonalStatusDto,
          updatedAt: new Date().toISOString(),
        },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'personalStatus-update',
        data: updatedPersonalStatus,
      });

      return updatedPersonalStatus;
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

  async remove({ id }: { id: number }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatusWithID = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatusWithID) {
        throw new Error(`Personal Status with ID ${id} not found`);
      }

      // remove the specified personalStatus
      const personalStatus = await this.prisma.personalStatus.delete({
        where: { id },
      });

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'personalStatus-deletion',
        data: personalStatus,
      });

      // return removed personalStatus
      return personalStatus;
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
