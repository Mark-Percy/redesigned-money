import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { TransAccountService } from '../trans-account.service';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent implements OnInit, AfterViewInit {
  today: Date = new Date();
  date: FormControl = new FormControl(new Date())
  amounts = {};
  totalAmount: number = 0;

  transactions: Observable<DocumentData[]>;

  listener!:any;
  @ViewChild('transTable',{static:false}) scrollTableRef!: ElementRef;
  showHead: boolean = false;

  constructor(private tras: TransAccountService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router, private renderer2: Renderer2, private _bottomSheet: MatBottomSheet) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month'])
    });
    this.tras.getAmountForMonth(this.date.value).then((data) => {
      this.setUpAmounts(data[0])  
    })
    this.transactions = this.tras.getTransactionsForMonth(this.date.value)
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth()}
      })
      this.transactions = this.tras.getTransactionsForMonth(value);
      this.tras.getAmountForMonth(this.date.value).then((data) => {
        this.setUpAmounts(data[0])
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

  addTransaction() {
    const addTransactionDialog = this.dialog.open(AddTransactionComponent, {data: {date:this.date.value}})
    addTransactionDialog.afterClosed().subscribe(() => {
      this.tras.getAmountForMonth(this.date.value).then((data) => {
        this.setUpAmounts(data[0])
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

  setUpAmounts(data: DocumentData) {
    this.totalAmount = data.amount
    delete data.amount
    this.amounts = data
  }

  openBottom() {
    this._bottomSheet.open(AmountsBottomSheet, {data: this.amounts})
  }
  
}

export interface Bills {
  annual:number;
  monthly: number;
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  templateUrl: './amounts-bottom-sheet.component.html',
  styles: ['div {display:grid; grid-template-columns: 50% 35%}', '.bills {display:flex;justify-content:space-between}']
})
export class AmountsBottomSheet {
  amounts = {}
  bills: number[] = []
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any, private _bottomSheetRef: MatBottomSheetRef<AmountsBottomSheet>) {
    try {
      this.bills = [data.bills.Annually, data.bills.Monthly]
    } catch {
      alert('Unable to open: perhaps the data is old format, If not raise with Redesigned money')
      this._bottomSheetRef.dismiss()
    }
    this.amounts = data
  }
}
