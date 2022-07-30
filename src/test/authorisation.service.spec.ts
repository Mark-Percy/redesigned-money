import { TestBed } from '@angular/core/testing';

import { AuthorisationService } from '../app/authorisation.service';

describe('AuthorisationService', () => {
  let service: AuthorisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorisationService);
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});
