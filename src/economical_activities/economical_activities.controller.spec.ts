import { Test, TestingModule } from '@nestjs/testing';
import { EconomicalActivitiesController } from './economical_activities.controller';
import { EconomicalActivitiesService } from './economical_activities.service';

describe('EconomicalActivitiesController', () => {
  let controller: EconomicalActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EconomicalActivitiesController],
      providers: [EconomicalActivitiesService],
    }).compile();

    controller = module.get<EconomicalActivitiesController>(EconomicalActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
