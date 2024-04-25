import { Test, TestingModule } from '@nestjs/testing';
import { EconomicalActivitiesService } from './economical_activities.service';

describe('EconomicalActivitiesService', () => {
  let service: EconomicalActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EconomicalActivitiesService],
    }).compile();

    service = module.get<EconomicalActivitiesService>(EconomicalActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
