import { TestBed } from '@angular/core/testing';

import { AccountsService } from '../app/shared/accounts.service';

import { AuthorisationService } from 'src/app/authorisation.service';
import { Firestore } from '@angular/fire/firestore';

fdescribe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Firestore, useClass: MockFirestore},
        {provide: AuthorisationService, useClass: MockAuthorisationService}
      ]
    });
    service = TestBed.inject(AccountsService);
    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

class MockFirestore {

}

class MockAuthorisationService {

}