import { ApiProperty } from '@nestjs/swagger';

export class CollectorCollection {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  firstnames: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  totalCollections: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalRest: number;

  @ApiProperty()
  collectedAt: Date;

  constructor(
    id: number,
    name: string,
    firstnames: string,
    phoneNumber: string,
    totalCollections: number,
    totalAmount: number,
    totalRest: number,
    collectedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.firstnames = firstnames;
    this.phoneNumber = phoneNumber;
    this.totalCollections = totalCollections;
    this.totalAmount = totalAmount;
    this.totalRest = totalRest;
    this.collectedAt = collectedAt;
  }
}
