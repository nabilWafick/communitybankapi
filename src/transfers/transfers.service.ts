import { Injectable } from '@nestjs/common';
import { CreateTransferDto, UpdateTransferDto } from './dto';
import { Prisma, Customer } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferEntity, TransferCountEntity } from './entities';
import { isDateString } from 'class-validator';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create({
    createTransferDto,
  }: {
    createTransferDto: CreateTransferDto;
  }): Promise<TransferEntity> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createTransferDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided issuing card ID exist
      const issuingCard = await this.prisma.card.findUnique({
        where: { id: createTransferDto.issuingCardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!issuingCard) {
        throw Error(`Issuing card not found`);
      }

      // check if the issuing card is usable
      if (issuingCard.repaidAt) {
        throw Error('Issuing Card already repaid');
      }

      if (issuingCard.satisfiedAt) {
        throw Error('Issuing Card already satisfied');
      }

      if (issuingCard.transferredAt) {
        throw Error('Issuing Card already transfered');
      }

      // check if the provided receiving card ID exist
      const receivingCard = await this.prisma.card.findUnique({
        where: { id: createTransferDto.receivingCardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!receivingCard) {
        throw Error(`Receiving card not found`);
      }

      // check if the receiving card is usable
      if (receivingCard.repaidAt) {
        throw Error('Receiving Card already repaid');
      }

      if (receivingCard.satisfiedAt) {
        throw Error('Receiving Card already satisfied');
      }

      if (receivingCard.transferredAt) {
        throw Error('Receiving Card already transfered');
      }

      // check if transfer is possible

      // fetch all validated settlements of the issuingCard
      const issuingCardValidatedSettlements = issuingCard.settlements.filter(
        (settlement) => settlement.isValidated,
      );

      // calculate the total of validated settlements
      const issuingCardValidatedSettlementsTotal =
        issuingCardValidatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

      // calculate the amount of all validated settlements
      const issuingCardSettlementsAmount =
        issuingCardValidatedSettlementsTotal *
        issuingCard.typesNumber *
        issuingCard.type.stake.toNumber();

      // calculate the amount to transfert
      const transferAmount = Math.round(
        (2 * issuingCardSettlementsAmount) / 3 - 300, // 300 for card fees
      );

      // calculate the number of settlement that the receiving card will receive
      const settlementsTransfer = Math.round(
        transferAmount /
          (receivingCard.typesNumber * receivingCard.type.stake.toNumber()),
      );

      if (settlementsTransfer < 1) {
        throw Error('Insufficient settlements');
      }

      // check if all receiving card setlements are not done
      // fetch all validated settlements of the receivingCard

      const receivingCardValidatedSettlements =
        receivingCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

      // calculate the total of validated settlements
      const receivingCardValidatedSettlementsTotal =
        receivingCardValidatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

      // throw an error if all settlements are done on receiving card
      if (receivingCardValidatedSettlementsTotal === 372) {
        throw Error('Receiving card settlements made');
      }

      // create a new transfer
      const newTransfer = await this.prisma.transfer.create({
        data: createTransferDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'transfer-addition',
        data: newTransfer,
      });

      return this.findOne({ id: newTransfer.id });
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
    cursor?: Prisma.TransferWhereUniqueInput;
    where?: Prisma.TransferWhereInput;
    orderBy?: Prisma.TransferOrderByWithRelationInput;
  }): Promise<TransferEntity[]> {
    try {
      // fetch all transfers with the specified parameters
      return await this.prisma.transfer.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        include: {
          issuingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          receivingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
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

  async countAll({
    where,
  }: {
    where?: Prisma.TransferWhereInput;
  }): Promise<TransferCountEntity> {
    try {
      // find all types
      const typesCount = await this.prisma.transfer.count({ where });

      // return types count
      return { count: typesCount };
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
    cursor?: Prisma.TransferWhereUniqueInput;
    where?: Prisma.TransferWhereInput;
    orderBy?: Prisma.TransferOrderByWithRelationInput;
  }): Promise<TransferCountEntity> {
    try {
      // find specific types
      const specificTypesCount = await this.prisma.transfer.count({
        skip: 0,
        take: (await this.countAll({})).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return types count
      return { count: specificTypesCount };
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

  async findOne({ id }: { id: number }): Promise<TransferEntity> {
    try {
      // fetch transfer with the provided ID
      const transfer = await this.prisma.transfer.findUnique({
        where: { id },
        include: {
          issuingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          receivingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
        },
      });

      // throw an error if any transfer is found
      if (!transfer) {
        throw new Error(`Transfer with ID ${id} not found`);
      }

      // return the requested transfer
      return transfer;
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
    updateTransferDto,
  }: {
    id: number;
    updateTransferDto: UpdateTransferDto;
  }): Promise<TransferEntity> {
    try {
      // fetch transfer with the provided ID
      const transfer = await this.prisma.transfer.findUnique({
        where: { id },
      });

      // throw an error if any transfer is found
      if (!transfer) {
        throw new Error(`Transfer with ID ${id} not found`);
      }

      // check if the transfer can be update
      if (transfer.validatedAt) {
        throw Error('Transfer already validated');
      }

      if (transfer.rejectedAt) {
        throw Error('Transfer already rejected');
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: updateTransferDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided issuing card ID exist
      const issuingCard = await this.prisma.card.findUnique({
        where: { id: updateTransferDto.issuingCardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!issuingCard) {
        throw Error(`Issuing card not found`);
      }

      // check if the provided receiving card ID exist
      const receivingCard = await this.prisma.card.findUnique({
        where: { id: updateTransferDto.receivingCardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!receivingCard) {
        throw Error(`Receiving card not found`);
      }

      // check if issuing card would be updated
      if (updateTransferDto.issuingCardId != transfer.issuingCardId) {
        throw Error('Issuing card immutable');
      }

      // check if receiving card would be updated
      if (updateTransferDto.receivingCardId != transfer.receivingCardId) {
        throw Error('Receiving card immutable');
      }

      // check it two transfer status dates are provided at the same time
      if (updateTransferDto.validatedAt && updateTransferDto.rejectedAt) {
        throw Error('Validation and Rejection dates provided');
      }

      // check if validation, rejection dates if provided are valid
      if (
        updateTransferDto.validatedAt &&
        !isDateString(updateTransferDto.validatedAt)
      ) {
        throw Error(`Invalid validation date`);
      }

      if (
        updateTransferDto.rejectedAt &&
        !isDateString(updateTransferDto.rejectedAt)
      ) {
        throw Error(`Invalid rejection date`);
      }

      // make transfer if it is validation
      if (updateTransferDto.validatedAt) {
        // fetch all settlements of issuing card calculate the total amount

        // fetch all validated settlements of the issuingCard
        const issuingCardValidatedSettlements = issuingCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

        // calculate the total of validated settlements
        const issuingCardValidatedSettlementsTotal =
          issuingCardValidatedSettlements.reduce(
            (total, settlement) => total + settlement.number,
            0,
          );

        // calculate the amount of all validated settlements
        const issuingCardSettlementsAmount =
          issuingCardValidatedSettlementsTotal *
          issuingCard.typesNumber *
          issuingCard.type.stake.toNumber();

        // calculate the amount to transfert
        const transferAmount = Math.round(
          (2 * issuingCardSettlementsAmount) / 3 - 300,
        );

        // calculate the number of settlement that the receiving card will receive
        let settlementsTransfer = Math.round(
          transferAmount /
            (receivingCard.typesNumber * receivingCard.type.stake.toNumber()),
        );

        if (settlementsTransfer < 1) {
          throw Error('Insufficient settlements');
        }

        // check if all receiving card setlements are not done
        // fetch all validated settlements of the receivingCard

        const receivingCardValidatedSettlements =
          receivingCard.settlements.filter(
            (settlement) => settlement.isValidated,
          );

        // calculate the total of validated settlements
        const receivingCardValidatedSettlementsTotal =
          receivingCardValidatedSettlements.reduce(
            (total, settlement) => total + settlement.number,
            0,
          );

        // throw an error if all settlements are done on rceiving card
        if (receivingCardValidatedSettlementsTotal === 372) {
          throw Error('Receiving card settlements made');
        }

        // check over settlements risk on the receiving card
        if (
          receivingCardValidatedSettlementsTotal + settlementsTransfer >
          372
        ) {
          settlementsTransfer = 372 - receivingCardValidatedSettlementsTotal;
        }

        // update issuing card, mark it as transfered
        const issuingCardUpdated = await this.prisma.card.update({
          where: {
            id: issuingCard.id,
          },
          data: {
            transferredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        // emit update event
        this.socketGateway.emitProductEvent({
          event: 'card-update',
          data: issuingCardUpdated,
        });

        // add settlement to receiving card
        const newSettlement = await this.prisma.settlement.create({
          data: {
            number: settlementsTransfer,
            cardId: receivingCard.id,
            collectionId: null,
            transferId: transfer.id,
            agentId: transfer.agentId,
            isValidated: true,
          },
        });

        // emit addition event
        this.socketGateway.emitProductEvent({
          event: 'settlement-addition',
          data: newSettlement,
        });
      }

      // update the transfer data
      const updatedTransfer = await this.prisma.transfer.update({
        where: { id },
        data: { ...updateTransferDto, updatedAt: new Date().toISOString() },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'transfer-update',
        data: updatedTransfer,
      });

      // return the updated transfer
      return this.findOne({ id });
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

  async remove({ id }: { id: number }): Promise<TransferEntity> {
    try {
      // fetch transfer with the provided ID
      const transferWithID = await this.prisma.transfer.findUnique({
        where: { id },
        include: {
          issuingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          receivingCard: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
        },
      });

      // throw an error if any transfer is found
      if (!transferWithID) {
        throw new Error(`Transfer with ID ${id} not found`);
      }

      if (transferWithID.validatedAt != null) {
        // update issuing card, mark it as not transfered
        const issuingCardUpdated = await this.prisma.card.update({
          where: {
            id: transferWithID.issuingCardId,
          },
          data: {
            transferredAt: null,
          },
        });

        // emit update event
        this.socketGateway.emitProductEvent({
          event: 'card-update',
          data: issuingCardUpdated,
        });

        // remove settlement added to receiving card
        const settlementDeleted = await this.prisma.settlement.deleteMany({
          where: {
            transferId: transferWithID.id,
          },
        });

        // emit deletion event
        this.socketGateway.emitProductEvent({
          event: 'settlement-deletion',
          data: settlementDeleted,
        });
      }

      // remove the specified transfer
      const transferDeleted = await this.prisma.transfer.delete({
        where: { id },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'transfer-deletion',
        data: transferDeleted,
      });

      // return removed transfer
      return transferWithID;
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
