import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardDto } from './dto/card.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CardEntity } from './entities/card.entity';
import { Prisma } from '@prisma/client';

@Controller('cards')
@ApiTags('Cards')
export class CardsController {
  constructor(private readonly cardService: CardsService) {}

  @Post()
  @ApiCreatedResponse({ type: CardEntity })
  async create(@Body() cardDto: CardDto): Promise<CardEntity> {
    try {
      return await this.cardService.create({
        cardDto: cardDto,
      });
    } catch (error) {
      if (error.message === 'Name already used') {
        throw new HttpException(
          {
            message: {
              en: 'The provided name is owned by another card',
              fr: "Le nom fourni est celui d'une autre carte",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Type not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified type is not found',
              fr: 'Le type spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Customer not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified customer is not found',
              fr: 'Le client spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: {
              en: 'Invalid request or data',
              fr: 'Données ou Requête invalide(s)',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to a service',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à un service",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to the database connection',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à la connection avec la base de données",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server. ${error.message}`,
            fr: `Une erreur s'est carde sur le serveur. ${error.message}`,
          },
          error: {
            en: 'Internal Serveur Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: CardEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CardEntity> {
    try {
      return await this.cardService.findOne({ id: +id });
    } catch (error) {
      if (error.message === `Card with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested card is not found',
              fr: 'La carte demandée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: {
              en: 'Invalid request or data',
              fr: 'Données ou Requête invalide(s)',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to a service',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à un service",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to the database connection',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à la connection avec la base de données",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server. ${error.message}`,
            fr: `Une erreur s'est carde sur le serveur. ${error.message}`,
          },
          error: {
            en: 'Internal Serveur Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOkResponse({ type: CardEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number | null,
    @Query('take', ParseIntPipe) take?: number | null,
    @Query('cursor') cursor?: Prisma.CardWhereUniqueInput,
    @Query('where') where?: Prisma.CardWhereInput,
    @Query('orderBy') orderBy?: Prisma.CardOrderByWithRelationInput,
  ): Promise<CardEntity[]> {
    try {
      return await this.cardService.findAll({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
      if (error.message === 'Records not found') {
        throw new HttpException(
          {
            message: {
              en: 'Any records found',
              fr: 'Aucune données trouvées',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: {
              en: 'Invalid request or data',
              fr: 'Données ou Requête invalide(s)',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to a service',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à un service",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to the database connection',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à la connection avec la base de données",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server. ${error.message}`,
            fr: `Une erreur s'est carde sur le serveur. ${error.message}`,
          },
          error: {
            en: 'Internal Serveur Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: CardEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() cardDto: CardDto,
  ): Promise<CardEntity> {
    try {
      return await this.cardService.update({
        id: +id,
        cardDto: cardDto,
      });
    } catch (error) {
      if (error.message === `Card with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested card is not found',
              fr: 'La carte demandée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Name already used') {
        throw new HttpException(
          {
            message: {
              en: 'The provided name is owned by another card',
              fr: "Le nom fourni est celui d'une autre carte",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Type not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified type is not found',
              fr: 'Le type spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Customer not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified customer is not found',
              fr: 'Le client spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid refund date') {
        throw new HttpException(
          {
            message: {
              en: 'The provided refund date is invalid',
              fr: 'Le date de remboursement fournie est invalide',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Invalid satisfaction date') {
        throw new HttpException(
          {
            message: {
              en: 'The provided satisfaction date is invalid',
              fr: 'Le date de satisfaction fournie est invalide',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Invalid transfer date') {
        throw new HttpException(
          {
            message: {
              en: 'The provided transfer date is invalid',
              fr: 'Le date de transfert fournie est invalide',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: {
              en: 'Invalid request or data',
              fr: 'Données ou Requête invalide(s)',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to a service',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à un service",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to the database connection',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à la connection avec la base de données",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server. ${error.message}`,
            fr: `Une erreur s'est carde sur le serveur. ${error.message}`,
          },
          error: {
            en: 'Internal Serveur Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: CardEntity })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<CardEntity> {
    try {
      return await this.cardService.remove({ id: +id });
    } catch (error) {
      if (error.message === `Card with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested card is not found',
              fr: 'La carte demandée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: {
              en: 'Invalid request or data',
              fr: 'Données ou Requête invalide(s)',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to a service',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à un service",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: {
              en: 'An error occurred on the server. Error related to the database connection',
              fr: "Une erreur s'est carde sur le serveur. Erreur liée à la connection avec la base de données",
            },
            error: {
              en: 'Internal Serveur Error',
              fr: 'Erreur Interne du Serveur',
            },
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server. ${error.message}`,
            fr: `Une erreur s'est carde sur le serveur. ${error.message}`,
          },
          error: {
            en: 'Internal Serveur Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
