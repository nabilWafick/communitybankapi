import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductForecastDto,
} from './dto';
import {
  ProductCountEntity,
  ProductEntity,
  ProductForecastEntity,
} from './entities';
import { ProductsService } from './products.service';
import { PermissionsGuard } from '../auth/guard/permissions.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Permissions } from '../auth/decorator/permissions.decorator';
//import { TypeEntity } from 'src/types/entities';

@Controller('products')
@ApiTags('Products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Permissions('add-product')
  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    try {
      return await this.productsService.create({
        createProductDto: createProductDto,
      });
    } catch (error) {
      if (error.message === 'Name already used') {
        throw new HttpException(
          {
            message: {
              en: 'The provided name is owned by another product',
              fr: "Le nom fourni est celui d'un autre produit",
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

  @Permissions('read-product')
  @Get(':id')
  @ApiOkResponse({ type: ProductEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductEntity> {
    try {
      return await this.productsService.findOne({ id: +id });
    } catch (error) {
      if (error.message === `Product with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested product is not found',
              fr: 'Le produit demandé est introuvable',
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

  /* // @Permissions('-product')
  @Get('populate/type-product')
  @ApiOkResponse({ type: TypeEntity })
  async poupulateTypeProduct() {
    try {
      return await this.productsService.poupulateTypeProduct();
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
  */

  @Permissions('read-product')
  @Get()
  @ApiOkResponse({ type: ProductEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.ProductWhereUniqueInput,
    @Query('where') where?: Prisma.ProductWhereInput,
    @Query('orderBy') orderBy?: Prisma.ProductOrderByWithRelationInput,
  ): Promise<ProductEntity[]> {
    try {
      return await this.productsService.findAll({
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

  @Permissions('read-product')
  @Get('count/all')
  @ApiOkResponse({ type: ProductCountEntity })
  async countAll(): Promise<ProductCountEntity> {
    try {
      return await this.productsService.countAll();
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

  @Permissions('read-product')
  @Get('count/specific')
  @ApiOkResponse({ type: ProductCountEntity })
  async countSpecific(
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('cursor') cursor?: Prisma.ProductWhereUniqueInput,
    @Query('where') where?: Prisma.ProductWhereInput,
    @Query('orderBy') orderBy?: Prisma.ProductOrderByWithRelationInput,
  ): Promise<ProductCountEntity> {
    try {
      return await this.productsService.countSpecific({
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

  @Permissions('update-product')
  @Patch(':id')
  @ApiOkResponse({ type: ProductEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    try {
      return await this.productsService.update({
        id: +id,
        updateProductDto: updateProductDto,
      });
    } catch (error) {
      if (error.message === `Product with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested product is not found',
              fr: 'Le produit demandé est introuvable',
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
              en: 'The provided name is owned by another product',
              fr: "Le nom fourni est celui d'un autre produit",
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

  @Permissions('delete-product')
  @Delete(':id')
  @ApiOkResponse({ type: ProductEntity })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ProductEntity> {
    try {
      return await this.productsService.remove({ id: +id });
    } catch (error) {
      if (error.message === `Product with ID ${id} not found`) {
        throw new HttpException(
          {
            message: {
              en: 'The requested product is not found',
              fr: 'Le produit demandé est introuvable',
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

  private parseQueryParam(
    value: string | undefined,
    type: 'number',
  ): number | undefined {
    if (value === undefined) return undefined;

    if (type === 'number') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
  }

  @Permissions('admin')
  @Get('/stats/forecasts')
  @ApiOkResponse({ type: ProductForecastEntity, isArray: true })
  async getProductForecast(
    @Query() query: Record<string, string>,
  ): Promise<ProductForecastEntity[]> {
    try {
      const getProductForecastDto: GetProductForecastDto = {
        productId: this.parseQueryParam(query.productId, 'number'),
        customerId: this.parseQueryParam(query.customerId, 'number'),
        collectorId: this.parseQueryParam(query.collectorId, 'number'),
        cardId: this.parseQueryParam(query.cardId, 'number'),
        typeId: this.parseQueryParam(query.typeId, 'number'),
        totalSettlementNumber: this.parseQueryParam(
          query.totalSettlementNumber,
          'number',
        ),
        offset: this.parseQueryParam(query.offset, 'number'),
        limit: this.parseQueryParam(query.limit, 'number'),
      };

      // Validate that required fields are present
      if (
        getProductForecastDto.offset === undefined ||
        getProductForecastDto.limit === undefined
      ) {
        throw new HttpException(
          {
            message: {
              en: 'Offset and limit are required query parameters',
              fr: 'Les paramètres offset et limit sont requis',
            },
            error: {
              en: 'Bad Request',
              fr: 'Requête Incorrecte',
            },
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.productsService.getProductsForecasts({
        getProductForecastDto: getProductForecastDto,
      });
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server: ${error.message}`,
            fr: `Une erreur s'est produite sur le serveur: ${error.message}`,
          },
          error: {
            en: 'Internal Server Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Permissions('admin')
  @Get('/stats/forecasts/count')
  @ApiOkResponse({
    type: ProductCountEntity,
  })
  async getProductsForecastsCount(): Promise<ProductCountEntity> {
    try {
      return this.productsService.getProductsForecastsCount();
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server: ${error.message}`,
            fr: `Une erreur s'est produite sur le serveur: ${error.message}`,
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
  @Get('/stats/forecasts/amount')
  @ApiOkResponse({
    type: ProductCountEntity,
  })
  async getProductsForecastsTotalAmount(): Promise<ProductCountEntity> {
    try {
      return this.productsService.getProductsForecastsTotalAmount();
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server: ${error.message}`,
            fr: `Une erreur s'est produite sur le serveur: ${error.message}`,
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
  @Get('/stats/forecasts/count/specific')
  @ApiOkResponse({ type: ProductCountEntity })
  async getSpecificProductsForecastsCount(
    @Query() query: Record<string, string>,
  ): Promise<ProductCountEntity> {
    try {
      const getProductForecastDto: GetProductForecastDto = {
        productId: this.parseQueryParam(query.productId, 'number'),
        customerId: this.parseQueryParam(query.customerId, 'number'),
        collectorId: this.parseQueryParam(query.collectorId, 'number'),
        cardId: this.parseQueryParam(query.cardId, 'number'),
        typeId: this.parseQueryParam(query.typeId, 'number'),
        totalSettlementNumber: this.parseQueryParam(
          query.totalSettlementNumber,
          'number',
        ),
        offset: 0,
        limit: 10,
      };

      return this.productsService.getSpecificProductsForecastsCount({
        getProductForecastDto: getProductForecastDto,
      });
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server: ${error.message}`,
            fr: `Une erreur s'est produite sur le serveur: ${error.message}`,
          },
          error: {
            en: 'Internal Server Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Permissions('admin')
  @Get('/stats/forecasts/specific/amount')
  @ApiOkResponse({ type: ProductCountEntity })
  async getSpecificProductsForecastsTotalAmount(
    @Query() query: Record<string, string>,
  ): Promise<ProductCountEntity> {
    try {
      const getProductForecastDto: GetProductForecastDto = {
        productId: this.parseQueryParam(query.productId, 'number'),
        customerId: this.parseQueryParam(query.customerId, 'number'),
        collectorId: this.parseQueryParam(query.collectorId, 'number'),
        cardId: this.parseQueryParam(query.cardId, 'number'),
        typeId: this.parseQueryParam(query.typeId, 'number'),
        totalSettlementNumber: this.parseQueryParam(
          query.totalSettlementNumber,
          'number',
        ),
        offset: 0,
        limit: 10,
      };

      return this.productsService.getSpecificProductsForecastsTotalAmount({
        getProductForecastDto: getProductForecastDto,
      });
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: `An error occurred on the server: ${error.message}`,
            fr: `Une erreur s'est produite sur le serveur: ${error.message}`,
          },
          error: {
            en: 'Internal Server Error',
            fr: 'Erreur Interne du Serveur',
          },
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
