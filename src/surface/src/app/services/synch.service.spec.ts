import { TestBed, inject } from '@angular/core/testing';

import { SynchService } from './synch.service';

describe('SynchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SynchService]
    });
  });

  it('should be created', inject([SynchService], (service: SynchService) => {
    expect(service).toBeTruthy();
  }));
});
