import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AddTransactionComponent, TransactionInterface } from '../add-transaction/add-transaction.component';
import { TransactionsService } from '../shared/transactions.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { AsyncPipe, CurrencyPipe, TitleCasePipe, KeyValuePipe } from '@angular/common';
import { TransactionsTableComponent } from '../transactions-table/transactions-table.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDatepickerInput, MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';

@Component({
    selector: 'app-transactions-view',
    templateUrl: './transactions-view.component.html',
    styleUrls: ['./transactions-view.component.css'],
    standalone: true,
    imports: [
      MatFormField,
      MatInput,
      FormsModule,
      MatDatepickerInput,
      ReactiveFormsModule,
      MatDatepicker,
      MatIconButton,
      MatIcon,
      MatButton,
      TransactionsTableComponent,
      AsyncPipe,
      CurrencyPipe,
    ]
})
export class TransactionsViewComponent implements OnDestroy {

  today: Date = new Date();
  transactions: Observable<TransactionInterface[]>;
  $transactions:Subscription;
  numberOfTransactions: number = 0;
  totalAmount: number = 0;
  date: FormControl = new FormControl(new Date())
  isHandset: Observable<BreakpointState> = this.responsive.observe(Breakpoints.HandsetPortrait);

  constructor(
      private transactionService: TransactionsService,
      private dialog: MatDialog, 
      private route: ActivatedRoute,
      private router: Router,
      private _bottomSheet: MatBottomSheet,
      private responsive: BreakpointObserver,
  ) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month']);
      this.date.value.setYear(params['year']);
      this.transactionService.setMonth(this.date.value, true).then(month => {
        if(month.transactions) this.transactions = month.transactions;
        this.$transactions = this.transactions.subscribe(() => {
          this.transactionService.setMonth(this.date.value, false).then(month => {
            this.totalAmount = month.totalsExcl;
            this.numberOfTransactions = month.totalTransactions
          });
        })
      })
    });
    // When the date in the page changes - refresh the data for the new date
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth(), year: value.getFullYear()}
      })
    })
  }
  ngOnDestroy(): void {
    this.$transactions.unsubscribe()
  }

  changeDate(numOfMonths: number) {
    const holderDate: Date = this.date.value
    holderDate.setMonth(this.date.value.getMonth() + numOfMonths);
    this.date.setValue(holderDate);
  }
  
  setMonthYear(value: Date, widget:any) {
    this.date.setValue(value);
    widget.close()
  }


  openBottom() {
    this._bottomSheet.open(AmountsBottomSheet, {data: this.date.value})
  }

  openTransactionsDialog(row: any) {
    const addTransactionDialog = this.dialog.open(AddTransactionComponent, {data: row})
  }

  checkCurrMonth(): boolean {
    return this.today.getMonth() == this.date.value.getMonth() && this.today.getFullYear() == this.date.value.getFullYear()
  }
  
  getMonthDays(): number {
    if(!this.checkCurrMonth()) {
      return new Date(this.date.value.getFullYear(), this.date.value.getMonth() + 1, 0).getDate()
    }
    return this.today.getDate()
  }
}

export interface Bills {
  annual:number;
  monthly: number;
  oneOff: number;
}

@Component({
    selector: 'bottom-sheet-overview-example-sheet',
    templateUrl: './amounts-bottom-sheet.component.html',
    styles: ['li {display:grid; grid-template-columns: 50% 35%}', '.bills {display:flex;justify-content:space-between}'],
    standalone: true,
    imports: [MatTabGroup, MatTab, TitleCasePipe, CurrencyPipe, KeyValuePipe]
})
export class AmountsBottomSheet {
  monthTransactions = this.transactionService.setMonth(this.passed, false);
  categoryAmounts: Map<string, number> = new Map();
  accountAmounts: Map<string, number> = new Map();
  constructor( 
    private transactionService: TransactionsService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public passed: any
  ) {
    this.monthTransactions.then(data => {
      this.categoryAmounts = data.categoryAmounts
      this.accountAmounts = data.accountAmounts
    })
  }
}
