import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { AccountsService } from '../shared/accounts.service';
import { TransactionsService } from '../shared/transactions.service';
import { Amount } from '../shared/amount';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent implements OnInit, AfterViewInit {
  today: Date = new Date();
  date: FormControl = new FormControl(new Date())
  amounts:Amount[] = [];
  totalAmount: number = 0;

  transactions: Observable<DocumentData[]>;

  listener!:any;
  @ViewChild('transTable',{static:false}) scrollTableRef!: ElementRef;
  showHead: boolean = false;

  constructor(
      private transactionService: TransactionsService,
      private accountsService: AccountsService,
      private dialog: MatDialog, private route: ActivatedRoute,
      private router: Router, private renderer2: Renderer2,
      private _bottomSheet: MatBottomSheet
  ) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month'])
    });
    this.transactionService.getAmountForMonth(this.date.value).then((data) => {
      if(data) this.setUpAmounts(data[0]);
    })
    this.transactions = this.transactionService.getTransactionsForMonth(this.date.value)
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth()}
      })
      this.transactions = this.transactionService.getTransactionsForMonth(value);
      this.transactionService.getAmountForMonth(this.date.value).then((data) => {
        if(data) this.setUpAmounts(data[0]);
      })
    })
  }
  ngAfterViewInit(): void {
    this.listener = this.renderer2.listen(this.scrollTableRef.nativeElement, 'scroll', (e) => {
      this.showHead = this.scrollTableRef.nativeElement.scrollTop > 6;
    })
  }
  ngOnInit(): void {
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
    addTransactionDialog.afterClosed().subscribe(() => {
      this.transactionService.getAmountForMonth(this.date.value).then((data) => {
        if(data) this.setUpAmounts(data[0]);
      })
    })
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
