import { TestBed } from '@angular/core/testing';

import { TransactionsService } from '../app/shared/services/transactions.service';

describe('TransAccountService', () => {
  let service: TransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsService);
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});
