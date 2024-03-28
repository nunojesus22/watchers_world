import { TestBed } from '@angular/core/testing';

import { GamificationserviceService } from './gamificationservice.service';

describe('GamificationserviceService', () => {
  let service: GamificationserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamificationserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
