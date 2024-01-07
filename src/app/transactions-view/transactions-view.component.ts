import { Component, Inject } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { AccountsService } from '../shared/accounts.service';
import { TransactionsService } from '../shared/transactions.service';
import { Amount } from '../shared/amount';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent {

  today: Date = new Date();
  date: FormControl = new FormControl(new Date())

  isHandset: Observable<BreakpointState> = this.responsive.observe(Breakpoints.HandsetPortrait);

  constructor(
      public transactionService: TransactionsService,
      private dialog: MatDialog, 
      private route: ActivatedRoute,
      private router: Router,
      private _bottomSheet: MatBottomSheet,
      private responsive: BreakpointObserver,
  ) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month'])
      this.date.value.setYear(params['year'])
    });
    
    this.transactionService.setTransactionsForMonth(this.date.value)
    
    // Allow the changing of the amount value when the data in the transactions updates
    // this.transactionService.transactions.subscribe(() => {
    //   this.transactionService.getAmountForMonth(this.date.value).then((data) => {
    //     if(data) this.setUpAmounts(data[0]);
    //   })
    // })

    // When the date in the page changes - refresh the data for the new date
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth(), year: value.getFullYear()}
      })
      this.transactionService.setTransactionsForMonth(value);
      // this.transactionService.getAmountForMonth(this.date.value).then((data) => {
      //   if(data) this.setUpAmounts(data[0]);
      //   else this.totalAmount = 0
      // })
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
  categoryAmounts = this.transactionService.categoryAmounts;
  accountAmounts = this.transactionService.accountAmounts
  constructor( 
    private transactionService: TransactionsService,
  ) {  

  }
}
