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
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import {
  AjustCollectionAmount,
  CreateCollectionDto,
  UpdateCollectionDto,
} from './dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CollectionEntity, CollectionCountEntity } from './entities';
import { Prisma } from '@prisma/client';
import { PermissionsGuard } from '../auth/guard/permissions.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Permissions } from '../auth/decorator/permissions.decorator';

@Controller('collections')
@ApiTags('Collections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Permissions('add-collection')
  @Post()
  @ApiCreatedResponse({ type: CollectionEntity })
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() req,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.create({
        createCollectionDto: {
          ...createCollectionDto,
          agentId: req.user.agentId,
        },
      });
    } catch (error) {
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

      if (error.message === 'Collector not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified collector is not found',
              fr: 'Le collecteur spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid collection date') {
        throw new HttpException(
          {
            message: {
              en: 'The provided collection date is invalid',
              fr: 'Le date de collecte fournie est invalide',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Collection already made') {
        throw new HttpException(
          {
            message: {
              en: 'The collector have already made a collection at that date',
              fr: 'Le collecteur a déjà éffectué une collecte à cette date',
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get(':id')
  @ApiOkResponse({ type: CollectionEntity })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.findOne({ id: +id });
    } catch (error) {
      if (error.message === `Collection with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested collection is not found',
              fr: 'La collecte demandée est introuvable',
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get()
  @ApiOkResponse({ type: CollectionEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CollectionWhereUniqueInput,
    @Query('where') where?: Prisma.CollectionWhereInput,
    @Query('orderBy') orderBy?: Prisma.CollectionOrderByWithRelationInput,
  ): Promise<CollectionEntity[]> {
    try {
      return await this.collectionsService.findAll({
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('count/all')
  @ApiOkResponse({ type: CollectionCountEntity })
  async countAll(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.countAll();
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('sum/all')
  @ApiOkResponse({ type: CollectionCountEntity })
  async sumAll(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.sumAll();
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('sum/all/rest')
  @ApiOkResponse({ type: CollectionCountEntity })
  async sumAllRest(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.sumAllRest();
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('count/specific')
  @ApiOkResponse({ type: CollectionCountEntity })
  async countSpecific(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CollectionWhereUniqueInput,
    @Query('where') where?: Prisma.CollectionWhereInput,
    @Query('orderBy') orderBy?: Prisma.CollectionOrderByWithRelationInput,
  ): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.countSpecific({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('sum/specific')
  @ApiOkResponse({ type: CollectionCountEntity })
  async sumSpecific(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CollectionWhereUniqueInput,
    @Query('where') where?: Prisma.CollectionWhereInput,
    @Query('orderBy') orderBy?: Prisma.CollectionOrderByWithRelationInput,
  ): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.sumSpecific({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('sum/specific/rest')
  @ApiOkResponse({ type: CollectionCountEntity })
  async sumSpecificRest(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CollectionWhereUniqueInput,
    @Query('where') where?: Prisma.CollectionWhereInput,
    @Query('orderBy') orderBy?: Prisma.CollectionOrderByWithRelationInput,
  ): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.sumSpecificRest({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('update-collection')
  @Patch(':id')
  @ApiOkResponse({ type: CollectionEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Req() req,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.update({
        id: +id,
        updateCollectionDto: {
          ...updateCollectionDto,
          agentId: req.user.agentId,
        },
      });
    } catch (error) {
      if (error.message === `Collection with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested collection is not found',
              fr: 'La collecte demandée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
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

      if (error.message === 'Collector not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified collector is not found',
              fr: 'Le collecteur spécifié est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Invalid collection date') {
        throw new HttpException(
          {
            message: {
              en: 'The provided collection date is invalid',
              fr: 'Le date de collecte fournie est invalide',
            },
            error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.message === 'Collection already made') {
        throw new HttpException(
          {
            message: {
              en: 'The collector have already made a collection at that date',
              fr: 'Le collecteur a déjà éffectué une collecte à cette date',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Collection date immutable') {
        throw new HttpException(
          {
            message: {
              en: "The collection date can't be modified. The collection have been already used to make settlements",
              fr: 'La date de collecte ne peut pas être modifiée. La collecte a déjà été utilisée pour effectuer des règlements',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Collector immutable') {
        throw new HttpException(
          {
            message: {
              en: "The collector can't be modified. The collection have been already used to make settlements",
              fr: 'Le collecteur ne peut pas être modifiée. La collecte a déjà été utilisée pour effectuer des règlements',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Amount immutable') {
        throw new HttpException(
          {
            message: {
              en: "The collection amount can't be modified. The collection have been already used to make settlements",
              fr: 'Le montant de la collecte ne peut pas être modifiée. La collecte a déjà été utilisée pour effectuer des règlements',
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
              en: "The author of the collection insertion can't be modified",
              fr: "L'auteur de l'insertion de la collecte ne peut pas être modifié",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('update-collection')
  @Patch('amount/increase/:id')
  @ApiOkResponse({ type: CollectionEntity })
  async increaseAmount(
    @Param('id', ParseIntPipe) id: number,
    @Body() ajustCollectionAmount: AjustCollectionAmount,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.increaseAmount({
        id: +id,
        ajustCollectionAmount: ajustCollectionAmount,
      });
    } catch (error) {
      if (error.message === `Collection with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested collection is not found',
              fr: 'La collecte demandée est introuvable',
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('update-collection')
  @Patch('amount/decrease/:id')
  @ApiOkResponse({ type: CollectionEntity })
  async decreaseAmount(
    @Param('id', ParseIntPipe) id: number,
    @Body() ajustCollectionAmount: AjustCollectionAmount,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.decreaseAmount({
        id: +id,
        ajustCollectionAmount: ajustCollectionAmount,
      });
    } catch (error) {
      if (error.message === `Collection with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested collection is not found',
              fr: 'La collecte demandée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Insufficient amount') {
        throw new HttpException(
          {
            message: {
              en: 'The remainder of the collection amount is insufficient to carry out this decrement',
              fr: 'Le reste du montant de la collecte est insuffisant pour effectuer cette décrémentation',
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('delete-collection')
  @Delete(':id')
  @ApiOkResponse({ type: CollectionEntity })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CollectionEntity> {
    try {
      return await this.collectionsService.remove({ id: +id });
    } catch (error) {
      if (error.message === `Collection with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested collection is not found',
              fr: 'La collecte demandée est introuvable',
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est collectione sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est collectione sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('/day/collection')
  @ApiOkResponse({ type: CollectionCountEntity })
  async getDayCollection(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.getDayCollection();
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('/week/collection')
  @ApiOkResponse({ type: CollectionCountEntity })
  async getWeekCollection(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.getWeekCollection();
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('/month/collection')
  @ApiOkResponse({ type: CollectionCountEntity })
  async getMonthCollection(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.getMonthCollection();
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('read-collection')
  @Get('/year/collection')
  @ApiOkResponse({ type: CollectionCountEntity })
  async getYearCollection(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.getYearCollection();
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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

  @Permissions('admin')
  @Get('profit/estimation')
  @ApiOkResponse({ type: CollectionCountEntity })
  async profit(): Promise<CollectionCountEntity> {
    try {
      return await this.collectionsService.profit();
    } catch (error) {
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est produite sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est produite sur le serveur. ${error.message}`,
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
