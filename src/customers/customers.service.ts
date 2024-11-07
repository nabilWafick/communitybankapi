import { Injectable } from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerEntity, CustomerCountEntity } from './entities';
import { isDateString } from 'class-validator';
import { CardsService } from 'src/cards/cards.service';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create({
    createCustomerDto,
  }: {
    createCustomerDto: CreateCustomerDto;
  }): Promise<CustomerEntity> {
    try {
      if (createCustomerDto.phoneNumber) {
        // find Many because phoneNumber is not defined as unique
        // find any collector with the provided phone number
        const customersWithPhoneNumber = await this.prisma.customer.findMany({
          where: {
            phoneNumber: createCustomerDto.phoneNumber,
          },
        });

        // throw an error if an collector is found
        if (customersWithPhoneNumber.length === 1) {
          throw new Error('Phone number already used');
        }
      }

      if (createCustomerDto.collectorId) {
        // check if the provided collector ID exist
        const collector = await this.prisma.collector.findUnique({
          where: { id: createCustomerDto.collectorId },
        });

        // throw an error if not
        if (!collector) {
          throw Error(`Collector not found`);
        }
      }

      if (createCustomerDto.localityId) {
        // check if the provided locality ID exist
        const locality = await this.prisma.locality.findUnique({
          where: { id: createCustomerDto.localityId },
        });

        // throw an error if not
        if (!locality) {
          throw Error(`Locality not found`);
        }
      }

      if (createCustomerDto.categoryId) {
        // check if the provided category ID exist
        const category = await this.prisma.category.findUnique({
          where: { id: createCustomerDto.categoryId },
        });

        // throw an error if not
        if (!category) {
          throw Error(`Category not found`);
        }
      }

      if (createCustomerDto.economicalActivityId) {
        // check if the provided economicalActivity ID exist
        const economicalActivity =
          await this.prisma.economicalActivity.findUnique({
            where: { id: createCustomerDto.economicalActivityId },
          });

        // throw an error if not
        if (!economicalActivity) {
          throw Error(`Economical activity not found`);
        }
      }

      if (createCustomerDto.personalStatusId) {
        // check if the provided locality ID exist
        const personalStatus = await this.prisma.personalStatus.findUnique({
          where: { id: createCustomerDto.personalStatusId },
        });

        // throw an error if not
        if (!personalStatus) {
          throw Error(`Personal status not found`);
        }
      }

      // create a new customer
      const customer = await this.prisma.customer.create({
        data: {
          name: createCustomerDto.name,
          firstnames: createCustomerDto.firstnames,
          phoneNumber: createCustomerDto.phoneNumber,
          address: createCustomerDto.address,
          occupation: createCustomerDto.occupation,
          nicNumber: createCustomerDto.nicNumber,
          collectorId: createCustomerDto.collectorId,
          categoryId: createCustomerDto.categoryId,
          economicalActivityId: createCustomerDto.economicalActivityId,
          personalStatusId: createCustomerDto.personalStatusId,
          localityId: createCustomerDto.localityId,
          profile: createCustomerDto.profile,
          signature: createCustomerDto.signature,
        },
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'customer-addition',
        data: customer,
      });

      //  createCustomerDto.cards[0]

      // add customer cards
      for (const cardDto of createCustomerDto.cards) {
        const newCard = await this.prisma.card.create({
          data: {
            label: cardDto.label,
            typesNumber: cardDto.typesNumber,
            typeId: cardDto.typeId,
            customerId: customer.id,
          },
        });

        // emit addition event
        this.socketGateway.emitProductEvent({
          event: 'card-addition',
          data: newCard,
        });
      }

      // return customer added
      return customer;
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
    cursor?: Prisma.CustomerWhereUniqueInput;
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
  }): Promise<CustomerEntity[]> {
    try {
      // fetch all customers with the specified parameters
      return await this.prisma.customer.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        include: {
          collector: true,
          locality: true,
          category: true,
          personalStatus: true,
          economicalActivity: true,
        },
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

  async countAll(): Promise<CustomerCountEntity> {
    try {
      // find all customers
      const customersCount = await this.prisma.customer.count();

      // return customers count
      return { count: customersCount };
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
    cursor?: Prisma.CustomerWhereUniqueInput;
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
  }): Promise<CustomerCountEntity> {
    try {
      // find specific customers
      const specificCustomersCount = await this.prisma.customer.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return customers count
      return { count: specificCustomersCount };
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

  async findOne({ id }: { id: number }): Promise<CustomerEntity> {
    try {
      // fetch customer with the provided ID
      const customer = await this.prisma.customer.findUnique({
        where: { id },
        include: {
          collector: true,
          locality: true,
          category: true,
          personalStatus: true,
          economicalActivity: true,
        },
      });

      // throw an error if any customer is found
      if (!customer) {
        throw new Error(`Customer with ID ${id} not found`);
      }

      // return the requested customer
      return customer;
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
    updateCustomerDto,
  }: {
    id: number;
    updateCustomerDto: UpdateCustomerDto;
  }): Promise<CustomerEntity> {
    try {
      const customerWithID = await this.prisma.customer.findUnique({
        where: {
          id,
        },
      });

      if (updateCustomerDto.phoneNumber) {
        // find Many because phoneNumber is not defined as unique
        // find any collector with the provided phone number
        const customersWithPhoneNumber = await this.prisma.customer.findMany({
          where: {
            phoneNumber: updateCustomerDto.phoneNumber,
          },
        });

        // throw an error if an collector is found
        if (
          customersWithPhoneNumber.length === 1 &&
          customersWithPhoneNumber[0].id != id
        ) {
          throw new Error('Phone number already used');
        }
      }

      if (updateCustomerDto.collectorId) {
        // check if the provided collector ID exist
        const collector = await this.prisma.collector.findUnique({
          where: { id: updateCustomerDto.collectorId },
        });

        // throw an error if not
        if (!collector) {
          throw Error(`Collector not found`);
        }

        /// * AUTORIZE CUSTOMER COLLECTOR UPDATE * ///
        /** 
        // check if collector make a collection from the customer
        // check if a settlement have be made

        const settlements = await this.prisma.settlement.findMany({
          where: {
            collection: {
              collector: {
                id: collector.id,
              },
            },
            card: {
              customer: {
                id: id,
              },
            },
          },
          include: {
            collection: {
              include: {
                collector: true,
              },
            },
            card: {
              include: {
                customer: true,
              },
            },
          },
        });

        if (settlements.length > 0) {
          throw Error('Immutable collector');
        }
        */
      } else {
        updateCustomerDto.collectorId = customerWithID.collectorId;
      }

      if (updateCustomerDto.localityId) {
        // check if the provided locality ID exist
        const locality = await this.prisma.locality.findUnique({
          where: { id: updateCustomerDto.localityId },
        });

        // throw an error if not
        if (!locality) {
          throw Error(`Locality not found`);
        }
      }

      if (updateCustomerDto.categoryId) {
        // check if the provided category ID exist
        const category = await this.prisma.category.findUnique({
          where: { id: updateCustomerDto.categoryId },
        });

        // throw an error if not
        if (!category) {
          throw Error(`Category not found`);
        }
      }

      if (updateCustomerDto.economicalActivityId) {
        // check if the provided economicalActivity ID exist
        const economicalActivity =
          await this.prisma.economicalActivity.findUnique({
            where: { id: updateCustomerDto.economicalActivityId },
          });

        // throw an error if not
        if (!economicalActivity) {
          throw Error(`Economical activity not found`);
        }
      }

      if (updateCustomerDto.personalStatusId) {
        // check if the provided locality ID exist
        const personalStatus = await this.prisma.personalStatus.findUnique({
          where: { id: updateCustomerDto.personalStatusId },
        });

        // throw an error if not
        if (!personalStatus) {
          throw Error(`Personal status not found`);
        }
      }

      // update a the customer
      const customer = await this.prisma.customer.update({
        where: { id },
        data: {
          name: updateCustomerDto.name,
          firstnames: updateCustomerDto.firstnames,
          phoneNumber: updateCustomerDto.phoneNumber,
          address: updateCustomerDto.address,
          occupation: updateCustomerDto.occupation,
          nicNumber: updateCustomerDto.nicNumber,
          collectorId: updateCustomerDto.collectorId,
          categoryId: updateCustomerDto.categoryId,
          economicalActivityId: updateCustomerDto.economicalActivityId,
          personalStatusId: updateCustomerDto.personalStatusId,
          localityId: updateCustomerDto.localityId,
          profile: updateCustomerDto.profile,
          signature: updateCustomerDto.signature,
        },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'customer-update',
        data: customer,
      });

      // add new customer cards
      for (const cardDto of updateCustomerDto.cards) {
        if (cardDto.id == null || cardDto.id == undefined) {
          const newCard = await this.prisma.card.create({
            data: {
              label: cardDto.label,
              typesNumber: cardDto.typesNumber,
              typeId: cardDto.typeId,
              customerId: customer.id,
            },
          });

          // emit addition event
          this.socketGateway.emitProductEvent({
            event: 'card-addition',
            data: newCard,
          });
        }
      }

      // return customer added
      return customer;
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

  async remove({ id }: { id: number }): Promise<CustomerEntity> {
    try {
      // fetch customer with the provided ID
      const customerWithID = await this.prisma.customer.findUnique({
        where: { id },
      });

      // throw an error if any customer is found
      if (!customerWithID) {
        throw new Error(`Customer with ID ${id} not found`);
      }

      // remove the specified customer
      const customer = await this.prisma.customer.delete({
        where: { id },
      });

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'customer-deletion',
        data: customer,
      });

      // return removed customer
      return customer;
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
