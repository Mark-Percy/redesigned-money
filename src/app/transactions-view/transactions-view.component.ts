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
  amounts:Amount[] = [];
  totalAmount: number = 0;
  transactions: Observable<DocumentData[]>;

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
      this.date.value.setMonth(params['month'])
      this.date.value.setYear(params['year'])
    });
    
    this.transactions = this.transactionService.getTransactionsForMonth(this.date.value)
    
    // Allow the changing of the amount value when the data in the transactions updates
    this.transactions.subscribe(() => {
      this.transactionService.getAmountForMonth(this.date.value).then((data) => {
        if(data) this.setUpAmounts(data[0]);
      })
    })

    // When the date in the page changes - refresh the data for the new date
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth(), year: value.getFullYear()}
      })
      this.transactions = this.transactionService.getTransactionsForMonth(value);
      this.transactionService.getAmountForMonth(this.date.value).then((data) => {
        if(data) this.setUpAmounts(data[0]);
        else this.totalAmount = 0
      })
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

  setUpAmounts(data: Amount[]) {
    const amount = data.find(item => item.name == 'amount')?.amount
    this.totalAmount = amount ? amount: 0
    this.amounts = data
  }

  openBottom() {
    this._bottomSheet.open(AmountsBottomSheet, {data: this.amounts})
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
  accountAm:Amount[] = [] 
  accountsArr: string[] = [];
  categoriesAm: Amount[] = [];
  bills: number[] = []
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: Amount[], 
    private accountsService: AccountsService,
  ) {
    this.accountsService.getAccounts().subscribe(res => {
      this.accountsArr = res.map(item => item.name)
      this.categoriesAm = data.filter(item => !this.accountsArr.includes(item.name) && item.name != 'amount')
      this.accountAm = data.filter(item => this.accountsArr.includes(item.name))
    })
  }
}
