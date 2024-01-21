import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionComponent } from '../app/add-transaction/add-transaction.component';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { AccountsService } from 'src/app/shared/accounts.service';
import { SavingsService } from 'src/app/shared/savings.service';
import { Observable, Subscriber } from 'rxjs';
import { Account } from 'src/app/user/account/account.interface';

fdescribe('AddTransactionComponent', () => {
  let component: AddTransactionComponent;
  let fixture: ComponentFixture<AddTransactionComponent>;
  
  let MockTransactionService: Partial<TransactionsService>;
  let MockAccountsService: Partial<AccountsService>;
  let MockSavingsService: Partial<SavingsService>;
  let MockMatDialogRef: Partial<MatDialogRef<AddTransactionComponent>>;
  let MockDateAdapter: Partial<DateAdapter<any>>;
  let MockDialogData;

  beforeEach(async () => {
    MockTransactionService = {

    }
    
    MockAccountsService = {
      getAccounts: () => {
        return new Observable(subscriber => {
          const accounts: Account[] = [
            { name: 'Account 1', type: 'Type 1' },
            { name: 'Account 2', type: 'Type 2' }
          ];
        
          subscriber.next(accounts);
          subscriber.complete();
        })
      }
    }

    MockSavingsService = {

    }
    
    MockMatDialogRef = {
      afterClosed: () => {
        return new Observable()
      }
    }
    MockDateAdapter = {
      setLocale: () => {

      }
    }

    MockDialogData = {
      date: null,
      row: null,
    }

    await TestBed.configureTestingModule({
      declarations: [ AddTransactionComponent ],
      providers: [
        {provide: TransactionsService, useValue: MockTransactionService},
        {provide: AccountsService, useValue: MockAccountsService},
        {provide: SavingsService, useValue: MockSavingsService},
        {provide: MatDialogRef, useValue: MockMatDialogRef},
        {provide: DateAdapter, useValue: MockDateAdapter},
        {provide: MAT_DIALOG_DATA, useValue: MockDialogData},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
