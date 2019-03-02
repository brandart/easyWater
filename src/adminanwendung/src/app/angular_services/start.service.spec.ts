import { TestBed, inject } from '@angular/core/testing';

import { StartService } from './start.service';

describe('StartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StartService]
    });
  });

  it('should be created', inject([StartService], (service: StartService) => {
    expect(service).toBeTruthy();
  }));
});
