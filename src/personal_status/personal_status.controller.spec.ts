import { Test, TestingModule } from '@nestjs/testing';
import { PersonalStatusController } from './personal_status.controller';
import { PersonalStatusService } from './personal_status.service';

describe('PersonalStatusController', () => {
  let controller: PersonalStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalStatusController],
      providers: [PersonalStatusService],
    }).compile();

    controller = module.get<PersonalStatusController>(PersonalStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
