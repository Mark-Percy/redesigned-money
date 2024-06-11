import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalsComponent } from './totals.component';
import { TransactionsService } from 'src/app/shared/transactions.service';

describe('TotalsComponent', () => {
  let component: TotalsComponent;
  let fixture: ComponentFixture<TotalsComponent>;
  let transactionsMock: Partial<TransactionsService>

  beforeEach(() => {

    transactionsMock = {
      setTransactionsForYear: () => Promise.resolve(new Map())
    }

    TestBed.configureTestingModule({
    imports: [TotalsComponent],
    providers: [{ provide: TransactionsService, useValue: transactionsMock }]
});
    fixture = TestBed.createComponent(TotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
