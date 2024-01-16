import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { TransactionMonthInterface, TransactionsService } from '../shared/transactions.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent {

  today: Date = new Date();
  date: FormControl = new FormControl(new Date())
  currMonth: TransactionMonthInterface = {accountAmounts: new Map(), categoryAmounts: new Map(), monthNum: 0, totalTransactions:0, totalAmount: 0};
  isHandset: Observable<BreakpointState> = this.responsive.observe(Breakpoints.HandsetPortrait);
  year: number = -1
  month: number = -1

  constructor(
      private transactionService: TransactionsService,
      private dialog: MatDialog, 
      private route: ActivatedRoute,
      private router: Router,
      private _bottomSheet: MatBottomSheet,
      private responsive: BreakpointObserver,
  ) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month'])
      this.date.value.setYear(params['year'])
      this.transactionService.getCurrMonth(this.date.value).then(month => {
        this.currMonth = month
        const monthIndexes = this.transactionService.getMonthIndexes(this.date.value)
        this.year = monthIndexes.yearIndex
        this.month = monthIndexes.monthIndex
      })
    });
    console.log(this.currMonth)

    // this.transactionService.setCurrentMonth(this.date.value, false, 0);

    // When the date in the page changes - refresh the data for the new date
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth(), year: value.getFullYear()}
      })
      this.transactionService.setCurrentMonth(this.date.value, false, 0)
    })
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
    this._bottomSheet.open(AmountsBottomSheet)
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
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  templateUrl: './amounts-bottom-sheet.component.html',
  styles: ['li {display:grid; grid-template-columns: 50% 35%}', '.bills {display:flex;justify-content:space-between}']
})
export class AmountsBottomSheet {
  monthTransactions = this.transactionService.getCurrMonth(new Date());
  categoryAmounts: Map<string, number> = new Map();
  accountAmounts: Map<string, number> = new Map();
  constructor( 
    private transactionService: TransactionsService,
  ) {
    
  }
}
