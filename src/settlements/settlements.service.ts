import { Injectable } from '@nestjs/common';
import {
  CreateSettlementDto,
  UpdateSettlementDto,
  CreateMultipleSettlementsDto,
} from './dto';
import { Prisma, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettlementEntity, SettlementCountEntity } from './entities';
import {
  transformWhereInput,
  transformQueryParams,
} from 'src/common/transformer/transformer.service';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async isSettlementDtoDataValid({
    createSettlementDto,
  }: {
    createSettlementDto: CreateSettlementDto;
  }): Promise<boolean> {
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

    if (card.transferredAt) {
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

    return true;
  }

  // will return the number of type of the card * type's stake
  async cardTypeStake({
    createSettlementDto,
  }: {
    createSettlementDto: CreateSettlementDto;
  }): Promise<number> {
    const card = await this.prisma.card.findUnique({
      where: { id: createSettlementDto.cardId },
      include: {
        type: true,
      },
    });

    return card.typesNumber * card.type.stake.toNumber();
  }

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

      if (card.transferredAt) {
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
        collection.rest
          .minus(
            createSettlementDto.number *
              card.typesNumber *
              card.type.stake.toNumber(),
          )
          .toNumber() < 0
      ) {
        throw Error('Insufficient amount of collection');
      }

      // substract settlement amount from
      // the remaining amount of the collection
      const collectionRest = collection.rest.minus(
        createSettlementDto.number *
          card.typesNumber *
          card.type.stake.toNumber(),
      );

      // update the collection
      await this.prisma.collection.update({
        where: {
          id: collection.id,
        },
        data: { rest: collectionRest, updatedAt: new Date() },
      });

      // create a new settlement
      const settlement = await this.prisma.settlement.create({
        data: createSettlementDto,
      });

      // return created settlement
      return this.findOne({ id: settlement.id });
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

  async createMultipleSettlement({
    createMultipleSettlementsDto,
  }: {
    createMultipleSettlementsDto: CreateMultipleSettlementsDto;
  }): Promise<SettlementEntity[]> {
    try {
      // check settlements data are valid
      createMultipleSettlementsDto.settlements.every((settlementDto) =>
        this.isSettlementDtoDataValid({ createSettlementDto: settlementDto }),
      );

      // TODO : check if all settlements will be done with a same collection

      let isAllForSameCollection =
        createMultipleSettlementsDto.settlements.every(
          (settlementDto) =>
            settlementDto.collectionId ===
            createMultipleSettlementsDto.settlements[0].collectionId,
        );

      // TODO: if yes, then, check if the amount will be sufficient for making them

      if (isAllForSameCollection === true) {
        // calculate the total amount of all settlements
        let settlementsTotalAmount = 0;

        for (const settlementDto of createMultipleSettlementsDto.settlements) {
          const cardTypeValue = await this.cardTypeStake({
            createSettlementDto: settlementDto,
          });

          settlementsTotalAmount += settlementDto.number * cardTypeValue;
        }

        // get collection data
        // check if the provided collection ID exist
        const collection = await this.prisma.collection.findUnique({
          where: {
            id: createMultipleSettlementsDto.settlements[0].collectionId,
          },
        });

        // check if the rest of collection is sufficient for making all
        // the settlements
        if (collection.rest.minus(settlementsTotalAmount).toNumber() < 0) {
          throw Error('Insufficient amount of collection for group');
        }
      }

      // make the multiple settlements if amount will be sufficient or if they are for different collection
      let settlements: SettlementEntity[] = [];

      for (const settlementDto of createMultipleSettlementsDto.settlements) {
        const settlement = await this.create({
          createSettlementDto: settlementDto,
        });

        settlements.push(settlement);
      }

      // return created settlements
      return settlements;
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
      /*    console.log('AND');
      if (where['AND']) {
        console.log(where['AND']);
        if (where['AND'][2]) {
          console.log('AND last');
          console.log(where['AND'][2]);
          console.log('Collection');
          console.log(where['AND'][2]['card']);
        }
      }

      console.log('after parsing');

      const w = transformQueryParams(where);

      console.log('============== AFTER TRANSFORMATION =================');
      if (w['AND']) {
        console.log(w['AND']);
        if (w['AND'][2]) {
          console.log('AND last');
          console.log(w['AND'][2]);
          console.log('Collection');
          console.log(w['AND'][2]['card']);
        }
      }
*/
      // fetch all settlements with the specified parameters
      return await this.prisma.settlement.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        include: {
          transfer: {
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
          },
          collection: {
            include: {
              collector: true,
              agent: true,
            },
          },
          card: {
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
              customer: true,
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

  async countAll(): Promise<SettlementCountEntity> {
    try {
      // find all settlements
      const settlementsCount = await this.prisma.settlement.count();

      // return settlements count
      return { count: settlementsCount };
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
    cursor?: Prisma.SettlementWhereUniqueInput;
    where?: Prisma.SettlementWhereInput;
    orderBy?: Prisma.SettlementOrderByWithRelationInput;
  }): Promise<SettlementCountEntity> {
    try {
      // find specific settlements
      const specificSettlementsCount = await this.prisma.settlement.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return settlements count
      return { count: specificSettlementsCount };
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

  async sumOfNumberForCard({
    cardId,
  }: {
    cardId: number;
  }): Promise<SettlementCountEntity> {
    try {
      // check if the card exist
      const cardExist = await this.prisma.card.findUnique({
        where: {
          id: cardId,
        },
      });

      if (!cardExist) {
        throw Error(`Card with ID ${cardId} not found`);
      }

      const sum = await this.prisma.settlement.aggregate({
        where: { cardId },
        _sum: {
          number: true,
        },
      });

      return { count: sum._sum.number || 0 };
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

  async findOne({ id }: { id: number }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlement = await this.prisma.settlement.findUnique({
        where: {
          id,
        },
        include: {
          transfer: {
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
          },
          collection: {
            include: {
              collector: true,
              agent: true,
            },
          },
          card: {
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
                  category: true,
                  personalStatus: true,
                  economicalActivity: true,
                  locality: true,
                },
              },
            },
          },
          agent: true,
        },
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
        where: {
          id,
        },
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
      if (
        updateSettlementDto.cardId &&
        updateSettlementDto.cardId != settlement.cardId
      ) {
        throw Error('Card immutable');
      }

      // check if settlement collection would be updated
      if (
        updateSettlementDto.collectionId &&
        updateSettlementDto.collectionId != settlement.collectionId
      ) {
        throw Error('Collection immutable');
      }

      // check if settlement agent would be updated
      if (
        updateSettlementDto.agentId &&
        updateSettlementDto.agentId != settlement.agentId
      ) {
        throw Error('Agent immutable');
      }

      // throw error if card is not usable
      if (settlement.card.repaidAt) {
        throw Error('Card already repaid');
      }

      if (settlement.card.satisfiedAt) {
        throw Error('Card already satisfied');
      }

      if (settlement.card.transferredAt) {
        throw Error('Card already transfered');
      }

      // check if the settlement is validated
      if (settlement.isValidated) {
        // check if the validation status would be switched to false
        if (updateSettlementDto.isValidated === false) {
          // check if the number is passed
          if (
            updateSettlementDto.number &&
            updateSettlementDto.number != settlement.number
          ) {
            throw Error('Immutable number and negatif status simultaneously');
          }

          // make retrocession of collection amount

          const settlementAmount = new Prisma.Decimal(
            settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber(),
          );

          const collectionRest =
            settlement.collection.rest.add(settlementAmount);

          await this.prisma.collection.update({
            where: {
              id: settlement.collection.id,
            },
            data: {
              rest: collectionRest,
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          // validation status passed is true or null

          // check if the number would be updated
          if (
            updateSettlementDto.number &&
            updateSettlementDto.number != settlement.number
          ) {
            // check if there is not a risk of over settlement

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
            if (
              validatedSettlementsTotal -
                settlement.number +
                updateSettlementDto.number >
              372
            ) {
              throw Error('Risk of over settlement');
            }

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

            // return the previous amount
            const previousCollectionAmount = settlement.collection.rest.add(
              previousSettlementAmount,
            );

            // substract the new amount
            const newCollectionAmount =
              previousCollectionAmount.toNumber() - newSettlementAmount;

            // update the collection
            this.prisma.collection.update({
              where: { id: settlement.collection.id },
              data: {
                rest: newCollectionAmount,
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
          if (
            updateSettlementDto.number &&
            updateSettlementDto.number != settlement.number
          ) {
            throw Error('Immutable number when negatif status');
          }
        } else {
          // the validation status would be passed to true

          // check if the number would be updated
          if (
            updateSettlementDto.number &&
            updateSettlementDto.number != settlement.number
          ) {
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
            // is enough for making the settlement

            const newSettlementAmount =
              updateSettlementDto.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            // throw an error if the remain amount is not enough
            if (
              settlement.collection.rest.toNumber() - newSettlementAmount <
              0
            ) {
              throw Error('Insufficient amount of collection');
            }

            // substract settlement amount from
            // the remaining amount of the collection
            const newCollectionAmount =
              settlement.collection.rest.minus(newSettlementAmount);

            // update the collection
            await this.prisma.collection.update({
              where: {
                id: settlement.collection.id,
              },
              data: {
                rest: newCollectionAmount,
                updatedAt: new Date(),
              },
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

            const settlementAmount =
              settlement.number *
              settlement.card.typesNumber *
              settlement.card.type.stake.toNumber();

            // throw an error if the remain amount is not enough
            if (settlement.collection.rest.toNumber() - settlementAmount < 0) {
              throw Error('Insufficient amount of collection');
            }

            // substract settlement amount from
            // the remaining amount of the collection
            const newCollectionAmount =
              settlement.collection.rest.minus(settlementAmount);

            // update the collection
            await this.prisma.collection.update({
              where: {
                id: settlement.collection.id,
              },
              data: {
                rest: newCollectionAmount,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        }
      }

      // update the settlement data
      await this.prisma.settlement.update({
        where: {
          id,
        },
        data: { ...updateSettlementDto, updatedAt: new Date().toISOString() },
      });

      return this.findOne({ id: id });
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
        where: {
          id,
        },
        include: {
          transfer: {
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
          },
          collection: {
            include: {
              collector: true,
              agent: true,
            },
          },
          card: {
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
                  category: true,
                  personalStatus: true,
                  economicalActivity: true,
                  locality: true,
                },
              },
            },
          },
          agent: true,
        },
      });

      // throw an error if any settlement is found
      if (!settlementWithID) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // throw an error if it is a transfered settlement

      if (settlementWithID.collectionId === null) {
        throw Error('Transfered settlement deletion impossible');
      }

      // check if the settlement is validated
      if (settlementWithID.isValidated) {
        // retrocede collection amount
        const collectionRest = settlementWithID.collection.rest.add(
          settlementWithID.card.typesNumber *
            settlementWithID.number *
            settlementWithID.card.type.stake.toNumber(),
        );

        // update collection amount
        await this.prisma.collection.update({
          where: {
            id: settlementWithID.collection.id,
          },
          data: {
            rest: collectionRest,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      // remove the specified settlement
      await this.prisma.settlement.delete({
        where: {
          id,
        },
      });

      // return removed settlement
      return settlementWithID;
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
