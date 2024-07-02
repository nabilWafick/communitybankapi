import { ApiProperty } from '@nestjs/swagger';

export class ProductForecastEntity {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  forecastNumber: number;

  @ApiProperty()
  forecastAmount: number;

  @ApiProperty()
  customersIds: number[];

  @ApiProperty()
  customersNames: string[];

  @ApiProperty()
  customersFirstnames: string[];

  @ApiProperty()
  collectorsIds: number[];

  @ApiProperty()
  collectorsNames: string[];

  @ApiProperty()
  collectorsFirstnames: string[];

  @ApiProperty()
  cardsIds: number[];

  @ApiProperty()
  cardsLabels: string[];

  @ApiProperty()
  cardsTypesNumbers: number[];

  @ApiProperty()
  typesIds: number[];

  @ApiProperty()
  typesNames: string[];

  @ApiProperty()
  totalsSettlementsNumbers: number[];

  @ApiProperty()
  totalsSettlementsAmounts: number[];

  @ApiProperty()
  forecastsNumbers: number[];

  @ApiProperty()
  forecastsAmounts: number[];

  constructor(
    productId: number,
    productName: string,
    forecastNumber: number,
    forecastAmount: number,
    customersIds: number[],
    customersNames: string[],
    customersFirstnames: string[],
    collectorsIds: number[],
    collectorsNames: string[],
    collectorsFirstnames: string[],
    cardsIds: number[],
    cardsLabels: string[],
    cardsTypesNumbers: number[],
    typesIds: number[],
    typesNames: string[],
    totalsSettlementsNumbers: number[],
    totalsSettlementsAmounts: number[],
    forecastsNumbers: number[],
    forecastsAmounts: number[],
  ) {
    this.productId = productId;
    this.productName = productName;
    this.forecastNumber = forecastNumber;
    this.forecastAmount = forecastAmount;
    this.customersIds = customersIds;
    this.customersNames = customersNames;
    this.customersFirstnames = customersFirstnames;
    this.collectorsIds = collectorsIds;
    this.collectorsNames = collectorsNames;
    this.collectorsFirstnames = collectorsFirstnames;
    this.cardsIds = cardsIds;
    this.cardsLabels = cardsLabels;
    this.cardsTypesNumbers = cardsTypesNumbers;
    this.typesIds = typesIds;
    this.typesNames = typesNames;
    this.totalsSettlementsNumbers = totalsSettlementsNumbers;
    this.totalsSettlementsAmounts = totalsSettlementsAmounts;
    this.forecastsNumbers = forecastsNumbers;
    this.forecastsAmounts = forecastsAmounts;
  }
}
