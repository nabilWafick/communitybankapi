import { Injectable } from '@nestjs/common';
import { CreateSettlementDto, UpdateSettlementDto } from './dto';
import { Prisma, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettlementEntity } from './entities/settlement.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createSettlementDto,
  }: {
    createSettlementDto: CreateSettlementDto;
  }): Promise<SettlementEntity> {
    try {
      // check if the settlement is validated
      if (!createSettlementDto.isValidated) {
        throw Error('Unvalidated settlement');
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createSettlementDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided card ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createSettlementDto.cardId },
        include: {
          settlements: true,
          type: true,
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // check if the card is usable
      if (card.repaidAt) {
        throw Error(`Card already repaid`);
      }

      if (card.satisfiedAt) {
        throw Error(`Card already satisfied`);
      }

      if (card.transferedAt) {
        throw Error(`Card already transfered`);
      }

      // check if the provided collection ID exist
      const collection = await this.prisma.collection.findUnique({
        where: { id: createSettlementDto.collectionId },
      });

      // throw an error if not
      if (!collection) {
        throw Error(`Collection not found`);
      }

      // check if the total of validated settlements done before
      // plus the settlement to add is greater than 372
      // (the maximum number of validated settlements of a customer card)

      // fetch all validated settlements of the customer card
      const validatedSettlements = card.settlements.filter(
        (settlement) => settlement.isValidated,
      );

      // calculate the total of validated settlements
      const validatedSettlementsTotal = validatedSettlements.reduce(
        (total, settlement) => total + settlement.number,
        0,
      );

      // throw an error if this could lead to excessive settlement
      if (validatedSettlementsTotal + createSettlementDto.number > 372) {
        throw Error('Risk of over settlement');
      }

      // check if the remain amount of the collection
      // is enough for making the settlement

      // throw an error if the remain amount is not enough
      if (
        collection.rest.toNumber() -
          createSettlementDto.number *
            card.typesNumber *
            card.type.stake.toNumber() <
        0
      ) {
        throw Error('Insufficient amount of collection');
      }

      // substract settlement amount from
      // the remaining amount of the collection
      collection.rest.toNumber() -
        createSettlementDto.number *
          card.typesNumber *
          card.type.stake.toNumber();

      // update the collection
      this.prisma.collection.update({
        where: {
          id: collection.id,
        },
        data: collection,
      });

      // create a new settlement
      return this.prisma.settlement.create({
        data: createSettlementDto,
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
    cursor?: Prisma.SettlementWhereUniqueInput;
    where?: Prisma.SettlementWhereInput;
    orderBy?: Prisma.SettlementOrderByWithRelationInput;
  }): Promise<SettlementEntity[]> {
    try {
      // fetch all settlements with the specified parameters
      return await this.prisma.settlement.findMany({
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

  async findOne({ id }: { id: number }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlement = await this.prisma.settlement.findUnique({
        where: { id },
      });

      // throw an error if any settlement is found
      if (!settlement) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // return the requested settlement
      return settlement;
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
    updateSettlementDto,
  }: {
    id: number;
    updateSettlementDto: UpdateSettlementDto;
  }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlement = await this.prisma.settlement.findUnique({
        where: { id },
        include: {
          card: {
            include: {
              type: true,
              settlements: true,
            },
          },
          collection: true,
          agent: true,
        },
      });

      // throw an error if any settlement is found
      if (!settlement) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // check if settlement card would be updated
      if (updateSettlementDto.cardId) {
        throw Error('Card immutable');
      }

      // check if settlement collection would be updated
      if (updateSettlementDto.collectionId) {
        throw Error('Collection immutable');
      }

      // check if settlement agent would be updated
      if (updateSettlementDto.collectionId) {
        throw Error('Agent immutable');
      }

      // throw error if card is not usable
      if (settlement.card.repaidAt) {
        throw Error('Card already repaid');
      }

      if (settlement.card.satisfiedAt) {
        throw Error('Card already satisfied');
      }

      if (settlement.card.transferedAt) {
        throw Error('Card already transfered');
      }

      // check if the settlement is validated
      if (settlement.isValidated) {
        // check if the validation status would be switched to false
        if (updateSettlementDto.isValidated === false) {
          // check if the number is passed
          if (updateSettlementDto.number) {
            throw Error('Immutable number and negatif status simultaneously');
          }

          // make retrocession of collection amount

          const settlementAmount = new Prisma.Decimal(
            settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber(),
          );

          settlement.collection.rest.add(settlementAmount);

          this.prisma.collection.update({
            where: {
              id: settlement.collection.id,
            },
            data: {
              ...settlement.collection,
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          // validation status passed is true or null

          // check if the number would be updated
          if (updateSettlementDto.number) {
            // check if remain collection amount is sufficient

            const previousSettlementAmount =
              settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            const newSettlementAmount =
              updateSettlementDto.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            // throw an error if the remain amount is not enough
            if (
              settlement.collection.rest.toNumber() +
                previousSettlementAmount -
                newSettlementAmount <
              0
            ) {
              throw Error('Insufficient amount of collection');
            }

            // substract the new amount
            settlement.collection.rest.toNumber() +
              previousSettlementAmount -
              newSettlementAmount;

            // update the collection
            this.prisma.collection.update({
              where: { id: settlement.collection.id },
              data: {
                ...settlement.collection,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        }
      } else {
        // settlement is unvalidated

        // check if the validation status passed is false or undefined
        if (
          updateSettlementDto.isValidated === null ||
          updateSettlementDto.isValidated === false
        ) {
          // check if the number would updated
          if (updateSettlementDto.number) {
            throw Error('Immutable number when negatif status');
          }
        } else {
          // the validation status would be passed to true

          // check if the number would be updated
          if (updateSettlementDto.number) {
            // re-make a the settlement

            // check if the maximum of settlememnt total is not reached
            // or will not be overflowed

            // fetch all validated settlements of the settlement card
            const validatedSettlements = settlement.card.settlements.filter(
              (settlement) => settlement.isValidated,
            );

            // calculate the total of validated settlements
            const validatedSettlementsTotal = validatedSettlements.reduce(
              (total, settlement) => total + settlement.number,
              0,
            );

            // throw an error if this could lead to excessive settlement
            if (validatedSettlementsTotal + updateSettlementDto.number > 372) {
              throw Error('Risk of over settlement');
            }

            // check if the remain amount of the collection
            // is enough for making the retrocession

            const previousSettlementAmount =
              settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            const newSettlementAmount =
              updateSettlementDto.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            // throw an error if the remain amount is not enough
            if (
              settlement.collection.rest.toNumber() -
                previousSettlementAmount +
                newSettlementAmount <
              0
            ) {
              throw Error('Insufficient amount of collection');
            }

            // substract settlement amount from
            // the remaining amount of the collection
            settlement.collection.rest.toNumber() -
              previousSettlementAmount +
              newSettlementAmount;

            // update the collection
            this.prisma.collection.update({
              where: {
                id: settlement.collection.id,
              },
              data: settlement.collection,
            });
          } else {
            // number would not be updated

            // re-make the settlement

            // check if the maximum of settlememnt total is not reached
            // or will not be overflowed

            // fetch all validated settlements of the settlement card
            const validatedSettlements = settlement.card.settlements.filter(
              (settlement) => settlement.isValidated,
            );

            // calculate the total of validated settlements
            const validatedSettlementsTotal = validatedSettlements.reduce(
              (total, settlement) => total + settlement.number,
              0,
            );

            // throw an error if this could lead to excessive settlement
            if (validatedSettlementsTotal + settlement.number > 372) {
              throw Error('Risk of over settlement');
            }

            // check if the remain amount of the collection
            // is enough for making the retrocession

            const previousSettlementAmount =
              settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            // throw an error if the remain amount is not enough
            if (
              settlement.collection.rest.toNumber() - previousSettlementAmount <
              0
            ) {
              throw Error('Insufficient amount of collection');
            }

            // substract settlement amount from
            // the remaining amount of the collection
            settlement.collection.rest.toNumber() - previousSettlementAmount;

            // update the collection
            this.prisma.collection.update({
              where: {
                id: settlement.collection.id,
              },
              data: settlement.collection,
            });
          }
        }
      }

      // update the settlement data
      return await this.prisma.settlement.update({
        where: { id },
        data: { ...updateSettlementDto, updatedAt: new Date().toISOString() },
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

  async remove({ id }: { id: number }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlementWithID = await this.prisma.settlement.findUnique({
        where: { id },
      });

      // throw an error if any settlement is found
      if (!settlementWithID) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // remove the specified settlement
      const settlement = await this.prisma.settlement.delete({
        where: { id },
      });

      // return removed settlement
      return settlement;
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
