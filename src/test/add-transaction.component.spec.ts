import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';



import { AddTransactionComponent } from '../app/shared/components/add-transaction/add-transaction.component';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { AccountsService } from 'src/app/shared/accounts.service';
import { SavingsService } from 'src/app/shared/savings.service';
import { Observable } from 'rxjs';
import { Account } from 'src/app/shared/interfaces/account.interface';

import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('AddTransactionComponent', () => {
  let component: AddTransactionComponent;
  let fixture: ComponentFixture<AddTransactionComponent>;
  let loader: HarnessLoader;
  
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
    providers: [
        { provide: TransactionsService, useValue: MockTransactionService },
        { provide: AccountsService, useValue: MockAccountsService },
        { provide: SavingsService, useValue: MockSavingsService },
        { provide: MatDialogRef, useValue: MockMatDialogRef },
        { provide: DateAdapter, useValue: MockDateAdapter },
        { provide: MAT_DIALOG_DATA, useValue: MockDialogData },
        // {provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    ],
    imports: [
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        // MatDatepickerModule,
        // MatNativeDateModule,
        ReactiveFormsModule,
        AddTransactionComponent,
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(AddTransactionComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
