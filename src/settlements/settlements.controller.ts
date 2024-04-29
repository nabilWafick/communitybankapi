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
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto, UpdateSettlementDto } from './dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SettlementEntity } from './entities/settlement.entity';
import { Prisma } from '@prisma/client';

@Controller('settlements')
@ApiTags('Settlements')
export class SettlementsController {
  constructor(private readonly settlementService: SettlementsService) {}

  @Post()
  @ApiCreatedResponse({ type: SettlementEntity })
  async create(
    @Body() createSettlementDto: CreateSettlementDto,
  ): Promise<SettlementEntity> {
    try {
      return await this.settlementService.create({
        createSettlementDto: createSettlementDto,
      });
    } catch (error) {
      if (error.message === 'Unvalidated settlement') {
        throw new HttpException(
          {
            message: {
              en: 'Any new settlement must be validated',
              fr: 'Tout nouveau règlement doit être validé',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Agent not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified agent is not found',
              fr: "L'agent spécifié est introuvable",
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Card not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified card is not found',
              fr: 'La carte spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Card already repaid') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already repaid',
              fr: 'La carte a été déjà remboursée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Card already satisfied') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already satisfied',
              fr: 'La carte a été déjà satisfaite',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Card already transfered') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already transfered',
              fr: 'La carte a été déjà transférée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Collection not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified collection is not found',
              fr: 'La collecte spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Risk of over settlement') {
        throw new HttpException(
          {
            message: {
              en: 'The number of remaining settlements is less than provided',
              fr: 'Le nombre de règlements restants est inférieur à celui fourni',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Insufficient amount of collection') {
        throw new HttpException(
          {
            message: {
              en: 'The remaining amount of the collection is insufficient',
              fr: 'Le montant restant de la collecte est insuffisant',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est settlemente sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: SettlementEntity })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SettlementEntity> {
    try {
      return await this.settlementService.findOne({ id: +id });
    } catch (error) {
      if (error.message === `settlement with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested settlement is not found',
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est settlemente sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: SettlementEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number | null,
    @Query('take', ParseIntPipe) take?: number | null,
    @Query('cursor') cursor?: Prisma.SettlementWhereUniqueInput,
    @Query('where') where?: Prisma.SettlementWhereInput,
    @Query('orderBy') orderBy?: Prisma.SettlementOrderByWithRelationInput,
  ): Promise<SettlementEntity[]> {
    try {
      return await this.settlementService.findAll({
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est settlemente sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: SettlementEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSettlementDto: UpdateSettlementDto,
  ): Promise<SettlementEntity> {
    try {
      return await this.settlementService.update({
        id: +id,
        updateSettlementDto: updateSettlementDto,
      });
    } catch (error) {
      if (error.message === `Settlement with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested settlement is not found',
              fr: 'Le règlement demandé est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Card immutable') {
        throw new HttpException(
          {
            message: {
              en: "The settlement's card can't be modified",
              fr: 'La carte du règlement ne peut pas être modifiée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Collection immutable') {
        throw new HttpException(
          {
            message: {
              en: "The settlement's collection can't be modified",
              fr: 'La collecte du règlement ne peut pas être modifiée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Agent immutable') {
        throw new HttpException(
          {
            message: {
              en: "The settlement's author can't be modified",
              fr: "L'auteur du règlement ne peut pas être modifié",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (
        error.message === 'Immutable number and negatif status simultaneously'
      ) {
        throw new HttpException(
          {
            message: {
              en: 'The status and the number of a validated settlement cannot be modified simultaneously',
              fr: "Le statut et le nombre d'un règlement validé ne peuvent pas être modifiés simultanément",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Immutable number when negatif status') {
        throw new HttpException(
          {
            message: {
              en: 'The number of an unvalidated settlement cannot be modified',
              fr: "Le nombre d'un règlement invalidé ne peut être modifié",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Agent not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified agent is not found',
              fr: "L'agent spécifié est introuvable",
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Card not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified card is not found',
              fr: 'La carte spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Card already repaid') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already repaid',
              fr: 'La carte a été déjà remboursée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Card already satisfied') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already satisfied',
              fr: 'La carte a été déjà satisfaite',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Card already transfered') {
        throw new HttpException(
          {
            message: {
              en: 'The card have been already transfered',
              fr: 'La carte a été déjà transférée',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Collection not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified collection is not found',
              fr: 'La collecte spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Risk of over settlement') {
        throw new HttpException(
          {
            message: {
              en: 'The number of remaining settlements is less than provided',
              fr: 'Le nombre de règlements restants est inférieur à celui fourni',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Insufficient amount of collection') {
        throw new HttpException(
          {
            message: {
              en: 'The remaining amount of the collection is insufficient',
              fr: 'Le montant restant de la collecte est insuffisant',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est settlemente sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: SettlementEntity })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SettlementEntity> {
    try {
      return await this.settlementService.remove({ id: +id });
    } catch (error) {
      if (error.message === `settlement with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested settlement is not found',
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est settlemente sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est settlemente sur le serveur. ${error.message}`,
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
