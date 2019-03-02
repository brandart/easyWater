import { TestBed, inject } from '@angular/core/testing';

import { CouchService } from './couch.service';

describe('CouchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CouchService]
    });
  });

  it('should be created', inject([CouchService], (service: CouchService) => {
    expect(service).toBeTruthy();
  }));
});
