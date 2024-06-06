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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerEntity, CustomerCountEntity } from './entities';
import { Prisma } from '@prisma/client';

@Controller('customers')
@ApiTags('Customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiCreatedResponse({ type: CustomerEntity })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    try {
      // return

      return await this.customersService.create({
        createCustomerDto: createCustomerDto,
      });
    } catch (error) {
      if (error.message === 'Phone number already used') {
        throw new HttpException(
          {
            message: {
              en: 'The provided phone number is owned by another customer',
              fr: "Le numéro de téléphone fourni est celui d'un autre client",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
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

      if (error.message === 'Locality not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified locality is not found',
              fr: 'La localité spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified category is not found',
              fr: 'La catégorie spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Economical activity not found') {
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

      if (error.message === 'Personal status not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified personal status is not found',
              fr: 'Le statut personnel spécifié est introuvable',
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est customere sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: CustomerEntity })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomerEntity> {
    try {
      return await this.customersService.findOne({ id: +id });
    } catch (error) {
      if (error.message === `Customer with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested customer is not found',
              fr: 'Le client demandé+ est introuvable',
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est customere sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: CustomerEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CustomerWhereUniqueInput,
    @Query('where') where?: Prisma.CustomerWhereInput,
    @Query('orderBy') orderBy?: Prisma.CustomerOrderByWithRelationInput,
  ): Promise<CustomerEntity[]> {
    try {
      return await this.customersService.findAll({
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est customere sur le serveur. ${error.message}`,
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

  @Get('count/all')
  @ApiOkResponse({ type: CustomerCountEntity })
  async countAll(): Promise<CustomerCountEntity> {
    try {
      return await this.customersService.countAll();
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

  @Get('count/specific')
  @ApiOkResponse({ type: CustomerCountEntity })
  async countSpecific(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.CustomerWhereUniqueInput,
    @Query('where') where?: Prisma.CustomerWhereInput,
    @Query('orderBy') orderBy?: Prisma.CustomerOrderByWithRelationInput,
  ): Promise<CustomerCountEntity> {
    try {
      return await this.customersService.countSpecific({
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

  @Patch(':id')
  @ApiOkResponse({ type: CustomerEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    try {
      return await this.customersService.update({
        id: +id,
        updateCustomerDto: updateCustomerDto,
      });
    } catch (error) {
      if (error.message === `Customer with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested customer is not found',
              fr: 'Le client demandé+ est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Phone number already used') {
        throw new HttpException(
          {
            message: {
              en: 'The provided phone number is owned by another customer',
              fr: "Le numéro de téléphone fourni est celui d'un autre client",
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
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

      if (error.message === 'Immutable collector') {
        throw new HttpException(
          {
            message: {
              en: 'The collector can be modified. The collector have made a collection from the customer',
              fr: 'Le collecteur ne peut être modifié. Le collecteur a effectué des collectes chez le client',
            },
            error: { en: 'Conflict', fr: 'Conflit' },
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.message === 'Locality not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified locality is not found',
              fr: 'La localité spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified category is not found',
              fr: 'La catégorie spécifiée est introuvable',
            },
            error: { en: 'Not Found', fr: 'Introuvable' },
            statusCode: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Economical activity not found') {
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

      if (error.message === 'Personal status not found') {
        throw new HttpException(
          {
            message: {
              en: 'The specified personal status is not found',
              fr: 'Le statut personnel spécifié est introuvable',
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est customere sur le serveur. ${error.message}`,
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
  @ApiOkResponse({ type: CustomerEntity })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<CustomerEntity> {
    try {
      return await this.customersService.remove({ id: +id });
    } catch (error) {
      if (error.message === `Customer with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested customer is not found',
              fr: 'Le client demandé+ est introuvable',
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à un service",
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
              fr: "Une erreur s'est customere sur le serveur. Erreur liée à la connection avec la base de données",
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
            fr: `Une erreur s'est customere sur le serveur. ${error.message}`,
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
