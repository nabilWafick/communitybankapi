import { Test, TestingModule } from '@nestjs/testing';
import { PersonalStatusService } from './personal_status.service';

describe('PersonalStatusService', () => {
  let service: PersonalStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalStatusService],
    }).compile();

    service = module.get<PersonalStatusService>(PersonalStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
