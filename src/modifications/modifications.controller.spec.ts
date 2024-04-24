import { Test, TestingModule } from '@nestjs/testing';
import { ModificationsController } from './modifications.controller';
import { ModificationsService } from './modifications.service';

describe('ModificationsController', () => {
  let controller: ModificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModificationsController],
      providers: [ModificationsService],
    }).compile();

    controller = module.get<ModificationsController>(ModificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
